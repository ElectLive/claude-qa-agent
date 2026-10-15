package controller

import (
	"context"
	"strings"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	qav1alpha1 "example.com/widget-operator/api/v1alpha1"
)

const finalizer = "qa.example.com/cleanup"

type WidgetReconciler struct {
	client.Client
}

// +kubebuilder:rbac:groups=qa.example.com,resources=widgets,verbs=get;list;watch;update;patch
// +kubebuilder:rbac:groups=qa.example.com,resources=widgets/status,verbs=get;update;patch
// +kubebuilder:rbac:groups="",resources=configmaps,verbs=get;list;watch;create;update;delete

func (r *WidgetReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var w qav1alpha1.Widget
	if err := r.Get(ctx, req.NamespacedName, &w); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	if !w.DeletionTimestamp.IsZero() {
		// Delete the rendered ConfigMap before letting the Widget go
		cm := &corev1.ConfigMap{ObjectMeta: metav1.ObjectMeta{Name: w.Name + "-config", Namespace: w.Namespace}}
		if err := r.Delete(ctx, cm); client.IgnoreNotFound(err) != nil {
			return ctrl.Result{}, err
		}
		controllerutil.RemoveFinalizer(&w, finalizer)
		return ctrl.Result{}, r.Update(ctx, &w)
	}

	if controllerutil.AddFinalizer(&w, finalizer) {
		if err := r.Update(ctx, &w); err != nil {
			return ctrl.Result{}, err
		}
	}

	if strings.HasSuffix(w.Spec.Image, ".missing") {
		meta.SetStatusCondition(&w.Status.Conditions, metav1.Condition{
			Type: "Ready", Status: metav1.ConditionFalse, Reason: "ImageUnavailable",
			Message: "image " + w.Spec.Image + " cannot be fetched",
		})
		return ctrl.Result{RequeueAfter: 30 * time.Second}, r.Status().Update(ctx, &w)
	}

	cm := &corev1.ConfigMap{ObjectMeta: metav1.ObjectMeta{Name: w.Name + "-config", Namespace: w.Namespace}}
	if _, err := controllerutil.CreateOrUpdate(ctx, r.Client, cm, func() error {
		cm.Data = map[string]string{"image": w.Spec.Image, "tier": w.Spec.Tier}
		return controllerutil.SetControllerReference(&w, cm, r.Scheme())
	}); err != nil {
		return ctrl.Result{}, err
	}

	meta.SetStatusCondition(&w.Status.Conditions, metav1.Condition{
		Type: "Ready", Status: metav1.ConditionTrue, Reason: "Reconciled", Message: "configuration rendered",
	})
	return ctrl.Result{}, r.Status().Update(ctx, &w)
}

func (r *WidgetReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).For(&qav1alpha1.Widget{}).Owns(&corev1.ConfigMap{}).Complete(r)
}
