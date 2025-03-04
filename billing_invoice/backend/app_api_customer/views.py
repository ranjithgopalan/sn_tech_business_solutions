import json
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView  # Import APIView
from .models import Customer, Cart, CartItem, Product,Summary
from .serializers import CustomerSerializer, CartSerializer, CartItemSerializer,ProductSerializer
from datetime import datetime,date
from .models import Customer,Invoice,Product
from django.db import IntegrityError, models
from django.http import JsonResponse
import io
import logging
from app_api_customer.logging_config import setup_logging
from django.db.models import Q



    # To validate the customer details
@api_view(['POST'])
def AddCustomer(request):
    logger = setup_logging('POST', 'AddCustomer')
    try:
        data = json.loads(request.body)
        customerName = data['customerName']
        email = data['email']
        phone_number = data['phone_number']
        address = data['address']
        gstin = data['gstin']

        if Customer.objects.filter(Q(phone_number=phone_number) | Q(email=email) | Q(gstin=gstin)).exists():
            logger.info(f"Customer already exists: {customerName}")
            return JsonResponse({'message': 'Customer already exists', 'customer_name': customerName}, status=200)
        else:
            customer = Customer.objects.create(
                customerName=customerName,
                email=email,
                phone_number=phone_number,
                address=address,
                gstin=gstin
            )
            logger.info(f"Customer added successfully: {customerName}")
            return JsonResponse({'message': 'Customer added successfully', 'customer_name': customerName}, status=200)
    except Exception as e:
        logger.info(f"Customer not added successfully: {str(e)}")
        return JsonResponse({'message': f'Customer not added successfully because of {str(e)}'}, status=400)

@api_view(['GET'])
def search_customers(request):
    query = request.GET.get('q', '')
    if query:
        customers = Customer.objects.filter(customerName__icontains=query)
        customer_list = customers.values('id', 'customerName', 'phone_number')
        return Response(customer_list, status=status.HTTP_200_OK)
    return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_customer_details(request):
    try:
        customer_id = request.GET.get('customer_id')
        customerName = request.GET.get('customerName')
        email = request.GET.get('email')
        phone_number = request.GET.get('phone_number')
        gstin = request.GET.get('gstin')

        customer = Customer.objects.filter(
             Q(id=customer_id)|Q(phone_number=phone_number) | Q(email=email) | Q(gstin=gstin)
        ).first()

        if customer:
            # logger.info(f"Customer found: {customer.customerName}")
            return JsonResponse({
                'customer_id': customer.id,
                'customer_name': customer.customerName,
                'phone_number': customer.phone_number
            }, status=200)
        else:
            logger.info(f"Customer not found: {customerName}")
            return JsonResponse({'message': 'Customer not found'}, status=404)
    except Exception as e:
        logger.info(f"Error retrieving customer details: {str(e)}")
        return JsonResponse({'message': f'Error retrieving customer details: {str(e)}'}, status=400)
    
@api_view(['GET'])
def customer_id_list(request):
    try:
        customers = Customer.objects.values('id', 'customerName', 'phone_number')
        return Response(customers, status=status.HTTP_200_OK)
    except Exception as e:
        logger.info(f"Error retrieving customer IDs: {str(e)}")
        return JsonResponse({'message': f'Error retrieving customer IDs: {str(e)}'}, status=400)


@api_view(['POST'])
def check_product_details(request):
    invoice_number = request.data.get('invoice_number')
    invoice_date = request.data.get('invoice_date')
    product_name = request.data.get('product_name')
    product_quantity = request.data.get('product_quantity')
    product_price = request.data.get('product_price')
    total_amount = request.data.get('total_amount')

    
    if Product.objects.filter(invoice_number=invoice_number).exists():
        return Response({'error': 'Invoice number already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Product.objects.filter(invoice_date=invoice_date).exists():
        return Response({'error': 'Invoice date already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Product.objects.filter(product_name=product_name).exists():
        return Response({'error': 'Product name already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Product.objects.filter(product_quantity=product_quantity).exists():
        return Response({'error': 'Quantity already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Product.objects.filter(product_price=product_price).exists():
        return Response({'error': 'Per quantity rate already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Product.objects.filter(total_amount=total_amount).exists():
        return Response({'error': 'Total amount already exists'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Product details are unique'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def customer_detail(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = CustomerSerializer(customer)
    return Response(serializer.data)

@api_view(['POST'])
def create_invoice(request):
    try:
        data = request.data
        customer_id = data['customer_id']
        customer = Customer.objects.get(id=customer_id)

        invoice = Invoice.objects.create(
            customer=customer,
            invoice_number=data['invoice_number'],
            invoice_date=data['invoice_date']
        )
        logger.info(f"Invoice created successfully: {invoice.invoice_number}")
        return Response({
            'message': 'Invoice created successfully',
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'invoice_date': invoice.invoice_date,
                'customer_id': invoice.customer.id
            }
        }, status=status.HTTP_201_CREATED)
    except Customer.DoesNotExist:
        logger.error(f"Customer not found: {customer_id} does not exist")
        return Response({'message': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        return Response({'message': f'Error creating invoice: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_product_to_invoice(request):
    try:
        data = request.data
        invoice_id = data['invoice_id']
        invoice = Invoice.objects.get(id=invoice_id)

        product = Product.objects.create(
            invoice=invoice,
            product_name=data['product_name'],
            product_quantity=data['product_quantity'],
            product_price=data['product_price'],
            total_amount=data['total_amount']
        )
        logger.info(f"Product added successfully: {product.product_name}")
        return Response({
            'message': 'Product added successfully',
            'product': {
                'id': product.id,
                'product_name': product.product_name,
                'product_quantity': product.product_quantity,
                'product_price': product.product_price,
                'total_amount': product.total_amount,
                'invoice_id': product.invoice.id
            }
        }, status=status.HTTP_201_CREATED)
    except Invoice.DoesNotExist:
        logger.error(f"Invoice not found: {invoice_id} does not exist")
        return Response({'message': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error adding product: {str(e)}")
        return Response({'message': f'Error adding product: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_products_by_invoice(request):
    try:
        invoice_id = request.GET.get('invoice_id')
        invoice = Invoice.objects.get(id=invoice_id)
        products = Product.objects.filter(invoice=invoice)

        product_list = [{
            'id': product.id,
            'product_name': product.product_name,
            'product_quantity': product.product_quantity,
            'product_price': product.product_price,
            'total_amount': product.total_amount
        } for product in products]

        return Response(product_list, status=status.HTTP_200_OK)
    except Invoice.DoesNotExist:
        logger.error(f"Invoice not found: {invoice_id} does not exist")
        return Response({'message': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error retrieving products: {str(e)}")
        return Response({'message': f'Error retrieving products: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)




# ATTEMPT_3!!!!!!!!!!!!!!!

import logging
logger = logging.getLogger(__name__)

from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
import logging

# Import all required models
from .models import Customer, Product, Invoice, InvoiceProducts
# Or if models are in different app:
# from your_app_name.models import Customer, Product, Invoice, InvoiceProducts

logger = logging.getLogger(__name__)

@api_view(['POST'])
def create_product(request):
    try:
        data = request.data
        customer_id = data.get('customer_id')

        if not customer_id:
            logger.error("customer_id is required")
            return JsonResponse({'message': 'customer_id is required'}, 
                              status=status.HTTP_400_BAD_REQUEST)

        # Get customer
        customer = Customer.objects.get(id=customer_id)

        # Create product with only necessary fields
        product = Product.objects.create(
            customer=customer,
            product_name=data['product_name'],
            product_quantity=data['product_quantity'],
            product_price=data['product_price'],
            total_amount=data['total_amount']
        )

        logger.info(f"Product added successfully: {product.product_name}")
        return JsonResponse({
            'message': 'Product added successfully',
            'product': {
                'id': product.id,
                'product_name': product.product_name,
                'product_price': str(product.product_price),
                'product_quantity': product.product_quantity,
                'total_amount': str(product.total_amount),
                'customer_id': customer.id
            }
        }, status=status.HTTP_201_CREATED)

    except Customer.DoesNotExist:
        logger.error(f"Customer not found: {customer_id}")
        return JsonResponse({'message': 'Customer not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    except KeyError as e:
        logger.error(f"Missing required field: {str(e)}")
        return JsonResponse({'message': f'Missing required field: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error adding product: {str(e)}")
        return JsonResponse({'message': f'Error adding product: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_products_by_user(request):
    try:
        user_id = request.GET.get('user_id')
        invoice_number = request.GET.get('invoice_number')
        logger.debug(f"Received user_id: {user_id}, invoice_number: {invoice_number}")
        
        if not user_id:
            logger.error("user_id parameter is missing")
            return Response({'message': 'user_id parameter is missing'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Get customer
        customer = Customer.objects.get(id=user_id)
        
        # Check if an invoice already exists with this invoice number and is saved
        if invoice_number:
            saved_invoice = Invoice.objects.filter(
                customer=customer,
                invoice_number=invoice_number,
                is_saved=True
            ).exists()
            
            if saved_invoice:
                logger.info(f"Saved invoice already exists for customer {user_id} with number {invoice_number}")
                return Response([], status=status.HTTP_200_OK)
        
        # Get products for this customer that are not part of any saved invoice
        # First, find products in saved invoices
        saved_product_ids = InvoiceProducts.objects.filter(
            invoice__customer=customer,
            invoice__is_saved=True
        ).values_list('products_id', flat=True).distinct()
        
        # Then, get all products for this customer excluding those in saved invoices
        products = Product.objects.filter(
            customer=customer
        ).exclude(
            id__in=saved_product_ids
        )
        
        # Build product list
        product_list = [{
            'id': product.id,
            'product_name': product.product_name,
            'product_quantity': product.product_quantity,
            'product_price': str(product.product_price),
            'total_amount': str(product.total_amount)
        } for product in products]

        return Response(product_list, status=status.HTTP_200_OK)
    
    except Customer.DoesNotExist:
        logger.error(f"Customer not found: {user_id} does not exist")
        return Response({'message': 'Customer not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error retrieving products: {str(e)}")
        return Response({'message': f'Error retrieving products: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['GET'])
# def get_products_by_user(request):
#     try:
#         user_id = request.GET.get('user_id')
#         invoice_number = request.GET.get('invoice_number')  # Get the current invoice number
#         logger.debug(f"Received customer_id: {user_id}, invoice_number: {invoice_number}")
        
#         if not user_id:
#             logger.error("customer_id parameter is missing")
#             return Response({'message': 'customer_id parameter is missing'}, 
#                           status=status.HTTP_400_BAD_REQUEST)

#         # Get customer
#         customer = Customer.objects.get(id=user_id)
        
#         # Get all products for this customer
#         products = Product.objects.filter(customer=customer)
        
#         # Filter out products that are already in a saved invoice (if we know invoice IDs are stored)
#         # This assumes you have some way to know which products are in saved invoices
#         # For example, if you have an InvoiceProducts model or similar that tracks this
        
#         # Get IDs of products that are already in saved invoices (except current one)
        
#         saved_product_ids = []
        
#         # If you have a table that links products to invoices (adjust as needed for your schema)
#         if hasattr(models, 'InvoiceProducts'):  # Check if the model exists
#             saved_product_ids = models.InvoiceProducts.objects.exclude(
#                 invoice__invoice_number=invoice_number  # Exclude current invoice
#             ).filter(
#                 product__customer=customer  # Only this customer's products
#             ).values_list('product_id', flat=True)
        
#         # Filter products to exclude those that are already saved
#         unsaved_products = products.exclude(id__in=saved_product_ids)
        
#         # Build product list with only product details
#         product_list = [{
#             'id': product.id,
#             'product_name': product.product_name,
#             'product_quantity': product.product_quantity,
#             'product_price': str(product.product_price),  # Convert Decimal to string for JSON
#             'total_amount': str(product.total_amount)    # Convert Decimal to string for JSON
#         } for product in unsaved_products]

#         return Response(product_list, status=status.HTTP_200_OK)
    
#     except Customer.DoesNotExist:
#         logger.error(f"Customer not found: {user_id} does not exist")
#         return Response({'message': 'Customer not found'}, 
#                        status=status.HTTP_404_NOT_FOUND)
    
#     except Exception as e:
#         logger.error(f"Error retrieving products: {str(e)}")
#         return Response({'message': f'Error retrieving products: {str(e)}'}, 
#                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# working API
# @api_view(['GET'])
# def get_products_by_user(request):
#     try:
#         user_id = request.GET.get('user_id')
#         logger.debug(f"Received customer_id: {user_id}")
        
#         if not user_id:
#             logger.error("customer_id parameter is missing")
#             return Response({'message': 'customer_id parameter is missing'}, 
#                           status=status.HTTP_400_BAD_REQUEST)

#         # Get customer and their products
#         customer = Customer.objects.get(id=user_id)
#         products = Product.objects.filter(customer=customer)
        
#         # Build product list with only product details
#         product_list = [{
#             'id': product.id,
#             'product_name': product.product_name,
#             'product_quantity': product.product_quantity,
#             'product_price': str(product.product_price),  # Convert Decimal to string for JSON
#             'total_amount': str(product.total_amount)    # Convert Decimal to string for JSON
#         } for product in products]

#         return Response(product_list, status=status.HTTP_200_OK)
    
#     except Customer.DoesNotExist:
#         logger.error(f"Customer not found: {user_id} does not exist")
#         return Response({'message': 'Customer not found'}, 
#                        status=status.HTTP_404_NOT_FOUND)
    
#     except Exception as e:
#         logger.error(f"Error retrieving products: {str(e)}")
#         return Response({'message': f'Error retrieving products: {str(e)}'}, 
#                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
logger = logging.getLogger(__name__)

@api_view(['DELETE'])
def delete_product(request, product_id):
    try:
        # Get and delete the product directly
        product = Product.objects.get(id=product_id)
        product.delete()
        
        return JsonResponse({
            'message': 'Product deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Product.DoesNotExist:
        logger.error(f"Product not found: {product_id}")
        return JsonResponse({
            'message': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        logger.error(f"Error deleting product: {str(e)}")
        return JsonResponse({
            'message': f'Error deleting product: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Working API

# @api_view(['POST'])
# def save_summary(request):
#     try:
#         # Get all data from request
#         customer_id = request.data.get('customer_id')
#         total_products = request.data.get('total_products')
#         total_amount = request.data.get('total_amount')
#         invoice_number = request.data.get('invoice_number')  # Get from request
#         invoice_date = request.data.get('invoice_date')      # Get from request

#         # Validate required fields
#         if not all([customer_id, invoice_number, invoice_date]):
#             return Response({
#                 'error': 'Customer ID, invoice number and date are required'
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # Get customer
#         customer = Customer.objects.get(id=customer_id)

#         # Create invoice with the provided details
#         invoice = Invoice.objects.create(
#             customer=customer,
#             invoice_number=invoice_number,
#             invoice_date=invoice_date,
#             is_saved=True
#         )

#         # Create summary
#         summary = Summary.objects.create(
#             user=customer,
#             total_products=total_products,
#             total_amount=total_amount
#         )

#         return Response({
#             'message': 'Summary saved successfully',
#             'invoice_number': invoice.invoice_number,
#             'invoice_date': invoice.invoice_date
#         }, status=status.HTTP_201_CREATED)

#     except Customer.DoesNotExist:
#         return Response({
#             'error': 'Customer not found'
#         }, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         return Response({
#             'error': f'Error saving summary: {str(e)}'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

@api_view(['POST'])
def save_summary(request):
    try:
        # Extract data from request
        data = request.data
        customer_id = data.get('customer_id')
        total_products = data.get('total_products')
        total_amount = data.get('total_amount')
        invoice_number = data.get('invoice_number')
        invoice_date = data.get('invoice_date')
        
        # Validate required fields
        if not customer_id or not invoice_number or not invoice_date:
            return Response({"error": "Customer ID, invoice number and date are required"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Get customer
        customer = Customer.objects.get(id=customer_id)
        
        # Get or create invoice
        invoice, created = Invoice.objects.get_or_create(
            customer=customer,
            invoice_number=invoice_number,
            defaults={'invoice_date': invoice_date}
        )
        
        # Create a new summary record (instead of get_or_create)
        summary = Summary.objects.create(
            user=customer,
            total_products=total_products,
            total_amount=total_amount
        )
        
        # Get all products for this customer that are not in any saved invoice
        saved_product_ids = InvoiceProducts.objects.filter(
            invoice__customer=customer,
            invoice__is_saved=True
        ).values_list('products_id', flat=True).distinct()
        
        unsaved_products = Product.objects.filter(
            customer=customer
        ).exclude(
            id__in=saved_product_ids
        )
        
        # Add these products to the invoice
        for product in unsaved_products:
            InvoiceProducts.objects.create(
                invoice=invoice,
                products=product,
                quantity=product.product_quantity,
                price=product.product_price
            )
        
        # Mark the invoice as saved
        invoice.is_saved = True
        invoice.save()
        
        # Return success response
        return Response({
            "message": "Summary saved successfully",
            "summary_id": summary.id,
            "invoice_id": invoice.id
        }, status=status.HTTP_201_CREATED)
        
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error saving summary: {str(e)}")
        return Response({"error": f"Failed to save summary: {str(e)}"}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_bills(request):
    try:
        # Get all summaries with their related customer information
        summaries = Summary.objects.select_related('user').all()
        
        bills = []
        for summary in summaries:
            try:
                # Get the saved invoices for this customer
                # We're filtering for is_saved=True to only get completed invoices
                invoices = Invoice.objects.filter(
                    customer=summary.user,
                    is_saved=True
                ).order_by('-invoice_date')  # Get most recent first
                
                # For each invoice, create a bill entry
                for invoice in invoices:
                    # Get the products in this invoice
                    invoice_products = InvoiceProducts.objects.filter(invoice=invoice)
                    
                    # Calculate totals for this specific invoice
                    total_products_count = invoice_products.count()
                    total_amount = sum(ip.price * ip.quantity for ip in invoice_products)
                    
                    bills.append({
                        'id': invoice.id,
                        'invoice_number': invoice.invoice_number,
                        'invoice_date': invoice.invoice_date,
                        'customer_name': summary.user.customerName,
                        'customer_id': summary.user.id,
                        'total_amount': total_amount,
                        'total_products': total_products_count,
                        'summary_id': summary.id
                    })
            except Exception as e:
                logger.error(f"Error processing summary for customer {summary.user.customerName}: {str(e)}")
                continue

        if not bills:
            return Response({
                'message': 'No bills found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Remove potential duplicates based on invoice_number
        unique_bills = {}
        for bill in bills:
            invoice_number = bill['invoice_number']
            if invoice_number not in unique_bills:
                unique_bills[invoice_number] = bill
        
        # Return as a list
        result = list(unique_bills.values())
        
        # Sort by invoice date (most recent first)
        result.sort(key=lambda x: x['invoice_date'], reverse=True)

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching bills: {str(e)}")
        return Response({
            'error': f'Error fetching bills: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# WORKING API

# @api_view(['GET'])
# def get_bills(request):
#     try:
#         # First, get all summaries with their related customer information
#         summaries = Summary.objects.select_related('user').all()
        
#         bills = []
#         for summary in summaries:
#             try:
#                 # Get the invoice for this customer
#                 invoice = Invoice.objects.filter(customer=summary.user).first()
                
#                 if invoice:
#                     bills.append({
#                         'invoice_number': invoice.invoice_number,
#                         'invoice_date': invoice.invoice_date,
#                         'customer_name': summary.user.customerName,
#                         'total_amount': summary.total_amount,
#                         'total_products': summary.total_products
#                     })
#             except Exception as e:
#                 logger.error(f"Error processing summary for customer {summary.user.customerName}: {str(e)}")
#                 continue

#         if not bills:
#             return Response({
#                 'message': 'No bills found'
#             }, status=status.HTTP_404_NOT_FOUND)

#         return Response(bills, status=status.HTTP_200_OK)

#     except Exception as e:
#         logger.error(f"Error fetching bills: {str(e)}")
#         return Response({
#             'error': 'Error fetching bills'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    
class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class AddToCartViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ViewCartViewSet(viewsets.ViewSet):
    def list(self, request):
        cart_items = CartItem.objects.all()
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data)
    
class RemoveFromCartViewSet(viewsets.ViewSet):
    def destroy(self, request, pk=None):
        try:
            cart_item = CartItem.objects.get(pk=pk)
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)