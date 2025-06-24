from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinValueValidator
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )
    
    # a regular expression with for the phone number field
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'."
    )
    
    phone_number = models.CharField(
        _('phone number'),
        validators=[phone_regex],
        max_length=17,
        unique=True,
        error_messages={
            'unique': _("A user with that phone number already exists."),
        },
    )

    score = models.PositiveIntegerField(
        _('loyalty score'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Points accumulated from orders')
    )

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
