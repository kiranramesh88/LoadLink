from django.contrib import admin

from .models import *

admin.site.register(QuestionnaireTemplate)

admin.site.register(WorkRequest)

admin.site.register(AssignedTeam)

admin.site.register(WorkAssignment)

admin.site.register(WorkStatusLog)

admin.site.register(WorkEvidence)

admin.site.register(Dispute)

admin.site.register(Payment)