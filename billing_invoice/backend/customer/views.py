from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView  # Import APIView
from .models import Customer, Cart, CartItem, Product,Summary
from .serializers import CustomerSerializer, CartSerializer, CartItemSerializer,ProductSerializer
from datetime import datetime
from .models import Customer
from django.db import IntegrityError

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    # To validate the customer details

@api_view(['GET'])
def search_customers(request):
    query = request.GET.get('q', '')
    if query:
        customers = Customer.objects.filter(customerName__icontains=query)
        customer_list = customers.values('id', 'customerName', 'phone_number')
        return Response(customer_list, status=status.HTTP_200_OK)
    return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def check_customer_details(request):
    email = request.data.get('email')
    phone_number = request.data.get('phone_number')
    gstin = request.data.get('gstin')

    if Customer.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Customer.objects.filter(phone_number=phone_number).exists():
        return Response({'error': 'Phone number already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if Customer.objects.filter(gstin=gstin).exists():
        return Response({'error': 'GSTIN already exists'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Customer details are unique'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def customer_id_list(request):
    customers = Customer.objects.values('id', 'customerName', 'phone_number')
    return Response(customers, status=status.HTTP_200_OK)

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
def create_product(request):
    data = request.data.copy()
    user_id = data.pop('user_id', None)
    
    if user_id is None:
        return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        customer = Customer.objects.get(id=user_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data['user'] = customer.id
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ATTEMPT_3!!!!!!!!!!!!!!!

import logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
def create_product2(request):
    # Log the entire incoming payload
    logger.info(f"Received Payload: {request.data}")
    
    # Print to console for immediate visibility
    print("Full Payload:", request.data)
    
    # Extract user_id explicitly
    user_id = request.data.get('user_id')
    print("Arjun hey")
    print(f"Extracted User ID: {user_id}")
    print(f"User ID Type: {type(user_id)}")

    if user_id is None:
        return Response(
            {"user_id": ["I AM HERE"]}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Convert to integer
        user_id = int(user_id)
    except (ValueError, TypeError):
        return Response(
            {"user_id": ["Invalid user ID format."]}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify customer exists
    try:
        customer = Customer.objects.get(id=user_id)
    except Customer.DoesNotExist:
        return Response(
            {"user_id": ["Customer not found."]}, 
            status=status.HTTP_404_NOT_FOUND
        )

    # Prepare product data
    product_data = request.data.copy()
    product_data['user_id'] = user_id

    # Validate and save
    serializer = ProductSerializer(data=product_data)
    
    if serializer.is_valid():
        try:
            product = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': 'An unexpected error occurred',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # If serialization fails, return errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # try:
    #     # Verify customer exists
    #     try:
    #         customer = Customer.objects.get(id=user_id)
    #         print(f"Customer Found: {customer}")
    #     except Customer.DoesNotExist:
    #         print(f"No Customer found with ID: {user_id}")
    #         return Response({
    #             'error': 'Customer not found', 
    #             'user_id': user_id
    #         }, status=status.HTTP_404_NOT_FOUND)

    #     # Prepare product data
    #     product_data = {
    #         'user': customer.id,  # Explicitly set user
    #         'invoice_number': request.data.get('invoice_number'),
    #         'invoice_date': request.data.get('invoice_date'),
    #         'product_name': request.data.get('product_name'),
    #         'product_price': request.data.get('product_price'),
    #         'product_quantity': request.data.get('product_quantity'),
    #         'total_amount': request.data.get('total_amount')
    #     }

    #     print("Prepared Product Data:", product_data)

    #     # Validate and save
    #     serializer = ProductSerializer(data=product_data)
        
    #     if serializer.is_valid():
    #         try:
    #             print("Serializer is Valid")
    #             product = serializer.save()
    #             print(f"Product Created: {product}")
    #             return Response(serializer.data, status=status.HTTP_201_CREATED)
    #         except Exception as e:
    #             print(f"Unexpected Error during save: {str(e)}")
    #             return Response({
    #                 'error': 'An unexpected error occurred during product creation',
    #                 'details': str(e)
    #             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    #     else:
    #         # Log serializer errors
    #         print("Serializer Errors:", serializer.errors)
    #         logger.error(f"Serializer Validation Errors: {serializer.errors}")
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # except Exception as e:
    #     print(f"Unexpected Error in create_product2: {str(e)}")
    #     logger.error(f"Unexpected Error in create_product2: {str(e)}")
    #     return Response({
    #         'error': 'An unexpected error occurred',
    #         'details': str(e)
    #     }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ATTEMPT_2!!!!!!!!!!!!!!!
# @api_view(['POST'])
# def create_product2(request):
#     data = request.data.copy()
    
#     # Extract user_id
#     user_id = data.get('user_id')
    
#     print(f"Received User ID: {user_id}")
    
#     # Validate user_id
#     if not user_id:
#         return Response({'user_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         # Fetch the customer
#         customer = Customer.objects.get(id=user_id)
#     except Customer.DoesNotExist:
#         return Response({'user_id': ['Customer not found.']}, status=status.HTTP_404_NOT_FOUND)

#     # Prepare data for serialization
#     product_data = {
#         'invoice_number': data.get('invoice_number'),
#         'invoice_date': data.get('invoice_date'),
#         'product_name': data.get('product_name'),
#         'product_price': data.get('product_price'),
#         'product_quantity': data.get('product_quantity'),
#         'total_amount': data.get('total_amount'),
#         'user': customer.id  # Explicitly set the user field
#     }
    
#     serializer = ProductSerializer(data=product_data)
    
#     if serializer.is_valid():
#         try:
#             # Save the product with the customer
#             product = serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except IntegrityError as e:
#             return Response({'error': 'Duplicate invoice number'}, status=status.HTTP_400_BAD_REQUEST)
    
#     # If serializer is not valid, return errors
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ATTEMPT_1!!!!!!!!!!!!!!!

# @api_view(['POST'])
# def create_product2(request):
#     data = request.data.copy()
#     user_id = data.pop('user_id', None)

#     print(f"Received User ID: {user_id}")
    
#     # Validate user_id
#     if user_id is None:
#         return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
#     try:
#         # Fetch the customer
#         customer = Customer.objects.get(id=user_id)
#     except Customer.DoesNotExist:
#         return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

#     # Add the customer to the data for serialization
#     data['user'] = customer.id  # Important: set the foreign key
    
#     serializer = ProductSerializer(data=data)
    
#     if serializer.is_valid():
#         try:
#             # Save the product with the customer
#             product = serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except IntegrityError as e:
#             return Response({'error': 'Duplicate invoice number'}, status=status.HTTP_400_BAD_REQUEST)
    
#     # If serializer is not valid, return errors
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_products_by_user(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        customer = Customer.objects.get(id=user_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    products = Product.objects.filter(user=customer)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# class CustomerIDListView(APIView):  # Use APIView
#     def get(self, request):
#         customers = Customer.objects.values( 'customerName', 'phone_number')
#         return Response(customers, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_customer_by_name(request):
    name = request.query_params.get('name')
    if not name:
        return Response({'error': 'Name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        customer = Customer.objects.get(customerName=name)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def save_summary(request):
    if request.method == 'POST':
        customer_id = request.data.get('customer_id')
        total_products = request.data.get('total_products')
        total_amount = request.data.get('total_amount')

        # Check if the customer exists
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create the Summary object
        try:
            summary = Summary.objects.get(user=customer)
            # Update the existing Summary object
            summary.total_products = total_products
            summary.total_amount = total_amount
            summary.save()
            return Response({'message': 'Summary updated successfully'}, status=status.HTTP_200_OK)
        except Summary.DoesNotExist:
            # Create a new Summary object
            summary = Summary(user=customer, total_products=total_products, total_amount=total_amount)
            summary.save()
            return Response({'message': 'Summary saved successfully'}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_bills(request):
    try:
        products = Product.objects.all()
        
        bills = []
        for product in products:
            customer = product.user
            summary = Summary.objects.filter(user_id=customer.id).first()
            if summary:
                bills.append({
                    'invoice_number': product.invoice_number,
                    'invoice_date': product.invoice_date,
                    'customer_name': customer.customerName,
                    'total_amount': summary.total_amount,
                })

        return Response(bills, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
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