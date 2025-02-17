from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  customer_id_list, check_customer_details,create_product, check_product_details,get_products_by_user,save_summary,get_bills,get_customer_by_name,customer_detail,search_customers,create_product2,customer_id_list,AddCustomer

router = DefaultRouter()
# router.register(r'customers', CustomerViewSet, basename='customer')
# router.register(r'carts', CartViewSet, basename='cart')
# router.register(r'add-to-cart', AddToCartViewSet, basename='add-to-cart')
# router.register(r'view-cart', ViewCartViewSet, basename='view-cart')
# router.register(r'remove-from-cart', RemoveFromCartViewSet, basename='remove-from-cart')
# router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('check-customer-details/',check_customer_details, name='check-customer-details'),
    path('search-customers/', search_customers, name='search-customers'),
    path('customer-ids/<int:pk>/', customer_id_list, name='customer-ids'),
    path('customer-by-name/', get_customer_by_name, name='customer-by-name'),
    path('create-product/',create_product, name='create-product'),
    path('create-product2/',create_product2, name='create-product2'),
    path('check-product-details/',check_product_details, name='check-product-details'),
    path('get-products-by-user/', get_products_by_user, name='get-products-by-user'),
    path('save-summary/', save_summary, name='save-summary'),
    path('bills/', get_bills, name='get-bills'),
    path('AddCustomer/',AddCustomer, name ='AddCustomer')

]
