from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import nowdate, nowtime, get_url
import face_recognition as fr
from frappe.utils.file_manager import save_file, get_file_path
import urllib.request



def compare_faces(file1, file2):
    print(file1, file2)
    
    # Load the jpg files into numpy arrays
    
    # image1 = fr.load_image_file(file1)
    # image2 = fr.load_image_file(file2)
    try:
        image1 = fr.load_image_file(urllib.request.urlopen(file1))
        image2 = fr.load_image_file(urllib.request.urlopen(file2))
        
        # Get the face encodings for 1st face in each image file
        image1_encoding = fr.face_encodings(image1)[0]
        image2_encoding = fr.face_encodings(image2)[0]
        
        # Compare faces and return True / False
        results = fr.compare_faces([image1_encoding], image2_encoding)    
        return results[0]
    except IndexError:
        return False

def get_fr_emp(emp_id):
    emp = frappe.get_doc('FR Employee', emp_id)
    return emp.employee


def check_today_log(emp_id, type):
    dlist = frappe.get_all('FR Attendance Log', filters = {'fr_employee': emp_id, 'type': type, 'date':nowdate(), 'matched':1})
    if len(dlist) > 0:
        return True
    else:
        return False

@frappe.whitelist(allow_guest = True)
def store_image(emp_id, image, device_name, ip_address, location, type):
    try:
        doc = frappe.get_doc('FR Employee', emp_id)
#         if not ip_address in doc.ip_restrict:
#             frappe.throw("This IP is not allowed!")
#             return

        if check_today_log(emp_id, type):
            return False    

        log_doc = frappe.new_doc('FR Attendance Log')
        log_doc.date = nowdate()
        log_doc.time = nowtime()
        log_doc.company = doc.company
        log_doc.employee = doc.employee
        log_doc.fr_employee = doc.name
        log_doc.ip_address = ip_address
        log_doc.location = location
        log_doc.device_name = device_name
        log_doc.type = type
        log_doc.insert(ignore_permissions=True)
        frappe.db.commit()

        f = save_file(fname = str(log_doc.name) + ".jpeg", content=image, dt ="FR Attendance Log", dn=log_doc.name, folder=None, decode=True, is_private=0, df='face_image')
        frappe.db.commit()
        mi = match_image(doc,log_doc)
        if mi == True:
            frappe.db.set_value('FR Attendance Log', log_doc.name, 'matched', 1)
            frappe.db.commit()
            return True
        else:
            return False    
    except Exception as e:
        frappe.throw(str(e))

def match_image(fr_emp_doc, new_image_doc):
    url_new_img = None
    emp_img_url = None
    file_list1 = frappe.get_all('File', filters={'attached_to_doctype': 'FR Attendance Log', 'attached_to_name': new_image_doc.name, 'attached_to_field':'face_image' }, fields=['name','file_url'])
    if len(file_list1) >0:
        #found entry
        for row in file_list1:
            url_new_img=frappe.utils.get_url()+row.file_url
            a = frappe.get_site_path('private', 'files', row.name)

    

    file_list = frappe.get_all('File', filters={'attached_to_doctype': 'FR Employee', 'attached_to_name': fr_emp_doc.name }, fields=['name','file_url'])

    if len(file_list) >0:
        #found entry
        for row in file_list:
            emp_img_url=frappe.utils.get_url()+row.file_url
            b = frappe.get_site_path('private', 'files', row.name)


    # frappe.throw(str(emp_img_url) + "|" + str(url_new_img))
    result = compare_faces(url_new_img, emp_img_url) 
    # frappe.throw(str(result))       
    return result



def test_img():
    doc1 = frappe.get_doc('FR Employee', 'FRE0001')
    doc2 = frappe.get_doc('FR Attendance Log', 'FRAL00004')
    match_image(doc1, doc2)




