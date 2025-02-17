from django.test import TestCase, Client
from django.urls import reverse
from .models import Customer  # Import the Customer model

class URLTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Update the fields according to your Customer model
        self.customer = Customer.objects.create(customerName='John', email='john.doe@example.com', phone_number='9846274199',address='pookad',gstin='123456789012345')

    def test_customer_list_create_url(self):
        url = reverse('customer-list-create')
        print(f"Testing URL: {url}")
        response = self.client.get(url)
        print(f"Response status code: {response.status_code}")
        self.assertEqual(response.status_code, 200)

    def test_customer_detail_url(self):
        url = reverse('customer-detail', args=[self.customer.id])
        print(f"Testing URL: {url}")
        response = self.client.get(url)
        print(f"Response status code: {response.status_code}")
        self.assertEqual(response.status_code, 200)