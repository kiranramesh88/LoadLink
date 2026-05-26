from rest_framework.permissions import BasePermission


# =========================================================
# CUSTOMER PERMISSION
# =========================================================

class IsCustomer(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and
            request.user.role == "CUSTOMER"
        )


# =========================================================
# WORKER PERMISSION
# =========================================================

class IsWorker(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and
            request.user.role == "WORKER"
        )


# =========================================================
# UNION PERMISSION
# =========================================================

class IsUnion(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and
            request.user.role == "UNION"
        )


# =========================================================
# CUSTOMER OR UNION
# =========================================================

class IsCustomerOrUnion(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and
            request.user.role in [
                "CUSTOMER",
                "UNION"
            ]
        )


# =========================================================
# WORK REQUEST ACCESS
# =========================================================

class HasWorkRequestAccess(BasePermission):

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        user = request.user

        # =============================================
        # CUSTOMER ACCESS
        # =============================================

        if (
            user.role == "CUSTOMER"
            and
            obj.customer.user == user
        ):

            return True

        # =============================================
        # UNION ACCESS
        # =============================================

        if user.role == "UNION":

            return True

        # =============================================
        # WORKER ACCESS
        # =============================================

        if user.role == "WORKER":

            return obj.worker_assignments.filter(
                worker=user.worker_profile
            ).exists()

        return False