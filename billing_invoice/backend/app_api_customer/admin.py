from django.contrib import admin
from .models import Customer

class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customerName', 'email', 'phone_number', 'address')
    ordering = ('customerName',)

admin.site.register(Customer, CustomerAdmin)