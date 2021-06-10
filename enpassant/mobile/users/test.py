import json

from rest_framework.test import APITestCase
from rest_framework import status
from django.test.client import Client
from django.urls import reverse
from django.contrib.auth import get_user_model


class TestLoginView(APITestCase):

    def test_obj_should_create(self):
        data = {
            "username": "prova",
            "password": "test",
            "email": "teststeestr@test.test",
            "country": "AF",
        }

        response = self.client.post(reverse("signup_view"),json.dumps(data))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
