package v1alpha1

import (
	"context"
	"fmt"
	"strings"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/validation/field"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"sigs.k8s.io/controller-runtime/pkg/webhook/admission"

	qav1alpha1 "example.com/widget-operator/api/v1alpha1"
)

const blockedRegistry = "https://registry.blocked.example.com/"
const protectedAnnotation = "qa.example.com/protected"

// +kubebuilder:webhook:path=/mutate-qa-example-com-v1alpha1-widget,mutating=true,failurePolicy=fail,groups=qa.example.com,resources=widgets,verbs=create;update,versions=v1alpha1,name=mwidget.qa.example.com,sideEffects=None,admissionReviewVersions=v1
// +kubebuilder:webhook:path=/validate-qa-example-com-v1alpha1-widget,mutating=false,failurePolicy=fail,groups=qa.example.com,resources=widgets,verbs=create;update;delete,versions=v1alpha1,name=vwidget.qa.example.com,sideEffects=None,admissionReviewVersions=v1

type WidgetCustomDefaulter struct{}

// Default sets maxReplicas to twice the size when it is not set.
func (d *WidgetCustomDefaulter) Default(ctx context.Context, obj runtime.Object) error {
	w := obj.(*qav1alpha1.Widget)
	if w.Spec.MaxReplicas == nil {
		m := w.Spec.Size * 2
		w.Spec.MaxReplicas = &m
	}
	return nil
}

type WidgetCustomValidator struct{}

func (v *WidgetCustomValidator) ValidateCreate(ctx context.Context, obj runtime.Object) (admission.Warnings, error) {
	w := obj.(*qav1alpha1.Widget)
	var errs field.ErrorList
	if strings.HasPrefix(w.Spec.Image, blockedRegistry) {
		errs = append(errs, field.Forbidden(field.NewPath("spec", "image"), "images from registry.blocked.example.com are not allowed"))
	}
	if len(errs) > 0 {
		return nil, apierrors.NewInvalid(qav1alpha1.GroupVersion.WithKind("Widget").GroupKind(), w.Name, errs)
	}
	return nil, nil
}

func (v *WidgetCustomValidator) ValidateUpdate(ctx context.Context, oldObj, newObj runtime.Object) (admission.Warnings, error) {
	oldW, newW := oldObj.(*qav1alpha1.Widget), newObj.(*qav1alpha1.Widget)
	if newW.Spec.Size < oldW.Spec.Size {
		return nil, apierrors.NewInvalid(qav1alpha1.GroupVersion.WithKind("Widget").GroupKind(), newW.Name, field.ErrorList{
			field.Invalid(field.NewPath("spec", "size"), newW.Spec.Size, fmt.Sprintf("spec.size cannot be decreased (was %d)", oldW.Spec.Size)),
		})
	}
	return nil, nil
}

func (v *WidgetCustomValidator) ValidateDelete(ctx context.Context, obj runtime.Object) (admission.Warnings, error) {
	w := obj.(*qav1alpha1.Widget)
	if w.Annotations[protectedAnnotation] == "true" {
		return nil, apierrors.NewForbidden(qav1alpha1.GroupVersion.WithResource("widgets").GroupResource(), w.Name,
			fmt.Errorf("widget is protected: remove the %s annotation first", protectedAnnotation))
	}
	return nil, nil
}
