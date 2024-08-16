from __future__ import unicode_literals
import frappe
from frappe import _
from fr_attendance.api import get_fr_emp


no_cache = 1

def get_context(context): 
	try:
		emp_id = frappe.form_dict['emp_id']
	except KeyError:
		# frappe.local.flags.redirect_location = '/esign'
		raise frappe.Redirect

	context.emp = get_fr_emp(emp_id)
	context.emp_id = emp_id