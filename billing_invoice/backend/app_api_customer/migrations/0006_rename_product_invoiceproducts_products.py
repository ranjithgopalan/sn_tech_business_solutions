# Generated by Django 5.0.6 on 2025-02-25 05:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app_api_customer', '0005_rename_invoice_product_customer_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='invoiceproducts',
            old_name='product',
            new_name='products',
        ),
    ]
