"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from app_api_customer.views import  customer_id_list, check_customer_details,create_product, check_product_details,get_products_by_user,save_summary,get_bills,get_customer_by_name,customer_detail,search_customers,create_product2

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', include(router.urls)),
    path('api/check-customer-details/',check_customer_details, name='check-customer-details'),
    # path('customers/<int:pk>/',customer_detail,name='customer-detail'),
    path('api/search-customers/', search_customers, name='search-customers'),
    path('api/customer-ids/<int:pk>/', customer_id_list, name='customer-ids'),
    path('api/customer-by-name/', get_customer_by_name, name='customer-by-name'),
    path('api/create-product/',create_product, name='create-product'),
    path('api/create-product2/',create_product2, name='create-product2'),
    path('api/check-product-details/',check_product_details, name='check-product-details'),
    #for getting products for a user
    path('api/get-products-by-user/', get_products_by_user, name='get-products-by-user'),
    path('api/save-summary/', save_summary, name='save-summary'),
    path('api/bills/', get_bills, name='get-bills'),
    # path('customer-ids/', CustomerIDListView.as_view(), name='customer-ids'),
]
