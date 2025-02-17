from rest_framework import serializers
from .models import Customer, Product, Cart, CartItem

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id','customerName', 'email', 'phone_number', 'address', 'gstin']

class ProductSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
                'user': {'required': True}
            }
        
        def validate_user_id(self, value):
        # Validate that the customer exists
            try:
                Customer.objects.get(id=value)
                return value
            except Customer.DoesNotExist:
                raise serializers.ValidationError("Customer does not exist")

        def create(self, validated_data):
        # Remove user_id from validated_data and use it to set the user
            user_id = validated_data.pop('user_id')
        
            try:
                customer = Customer.objects.get(id=user_id)
                validated_data['user'] = customer
                return super().create(validated_data)
            except Customer.DoesNotExist:
                raise serializers.ValidationError({"user_id": "Customer not found"})
      




        # def create(self, validated_data):
        #     user_id = validated_data.pop('user_id')
        #     user = Customer.objects.get(id=user_id)
        #     product = Product.objects.create(user=user, **validated_data)
        #     return product
        

class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'quantity', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'invoice_number', 'invoice_date', 'items']