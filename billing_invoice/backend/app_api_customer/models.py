from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal

class Customer(models.Model):
    customerName = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    gstin = models.CharField(max_length=8)  # Standard GSTIN is 15 characters

    def __str__(self):
        return self.customerName

    class Meta:
        db_table = 'customer'

class Product(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='products')
    product_name = models.CharField(max_length=100)
    product_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    product_quantity = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        # Auto-calculate total amount before saving
        self.total_amount = self.product_price * self.product_quantity
        super(Product, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} - {self.customer.customerName}"

    class Meta:
        db_table = 'product'

class Invoice(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField(auto_now_add=True)
    products = models.ManyToManyField(Product, through='InvoiceProducts')
    is_saved = models.BooleanField(default=False)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.customerName}"

    class Meta:
        db_table = 'invoice'

class InvoiceProducts(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    products = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    class Meta:
        db_table = 'invoice_products'
        verbose_name_plural = 'Invoice Products'

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.product.product_name}"


class Summary(models.Model):
    # invoice = models.OneToOneField(
    #     Invoice, 
    #     on_delete=models.CASCADE, 
    #     related_name='summary'
    # )
    user = models.ForeignKey(Customer, related_name='summary', on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_products = models.PositiveIntegerField()



class Meta:
        db_table = 'summary'
        verbose_name_plural = 'Summaries'

class Cart(models.Model):
    user = models.ForeignKey(Customer, related_name='carts', on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='CartItem')
    created_at = models.DateTimeField(default=timezone.now)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    added_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.product.product_name} ({self.quantity})"
    
class Summary(models.Model):
    user = models.ForeignKey(Customer, related_name='summary', on_delete=models.CASCADE)
    total_amount = models.FloatField(null=True)
    total_products = models.IntegerField(null=True)
    
    def __str__(self):
        return self.total_amount
    
