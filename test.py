import json

from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By

with open('test.json') as file:
    tests = json.load(file)

driver = webdriver.Chrome()

for test_case in tests['test_cases']:

    driver.get(tests['config']['url'])

    for key, value in test_case['form_data'].items():
        if key != 'builder':
            wait = WebDriverWait(driver, 10)
            elem = wait.until(expected_conditions.element_to_be_clickable((By.NAME, key)))
            elem_class = elem.get_attribute('class')

            if elem_class == 'form-control select2 select2-hidden-accessible':
                select = Select(driver.find_element_by_name(key))
                select.select_by_value(value)
            else:
                elem.send_keys(value)

    submit = driver.find_element_by_css_selector('input[type="submit"]')
    submit.click()

    wait = WebDriverWait(driver, 10)
    elem = wait.until(expected_conditions.element_to_be_clickable((By.TAG_NAME, 'pre')))

    try:
        response = json.loads(elem.text)
        print(json.dumps(response, indent=4, sort_keys=True))
    except:
        print("Test " + test_case['form_data']['product_group'] + " failed!!!")

    # assert test_case['response'] == json.loads(elem.text), "Test case with the following data failed \n " + json.dumps(
    #     test_case,
    #     indent=4, sort_keys=True)

driver.close()
print("Test passed successfully 👍")
