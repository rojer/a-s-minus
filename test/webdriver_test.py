import math
import time
import unittest

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

class ASMinusTest(unittest.TestCase):
    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument('load-extension=/home/rojer/asminus')
        self._driver = webdriver.Chrome(chrome_options=options)

    def tearDown(self):
        self._driver.quit()

    def testTools(self):
        d = self._driver
        d.set_window_size(800, 600)
        d.get('http://localhost:8080/fixed-long.html');
        self.assertEqual(len(d.window_handles), 1)
        cw = d.current_window_handle
        body = d.find_element_by_tag_name('body')
        body.send_keys(Keys.CONTROL, Keys.SHIFT, 'v')
        time.sleep(1)
        self.assertEqual(len(d.window_handles), 2, 'Edit window failed to open')
        ew = [wh for wh in d.window_handles if wh != cw][0]
        d.switch_to.window(ew)
        self.assertEqual(d.current_url,
                         'chrome-extension://bnophbnknjcjnbadhhkciahanapffepm/edit.html')
        show_canvas = d.find_element_by_id('show-canvas')
        def selected_color():
            return d.find_element_by_css_selector('#color span').value_of_css_property('background-color')

        buttons = {}
        for tool in ('crop', 'rectangle', 'ellipse', 'arrow', 'line', 'free-line', 'text-highlighter', 'blur', 'text', 'color'):
            button = d.find_element_by_id(tool)
            self.assertIsNotNone(button, '%s button not found' % tool)
            self.assertTrue(button.is_displayed(), '%s button is not visible')
            self.assertTrue(button.is_enabled(), '%s button is not enabled')
            buttons[tool] = button
        self.assertEquals(selected_color(), 'rgba(255, 0, 0, 1)')

        # crop the image
        with ActionChains(d) as ac:
            ac.move_to_element(buttons['crop'])
            ac.click()
            ac.move_to_element_with_offset(show_canvas, 100, 100)
            ac.click_and_hold()
            ac.move_to_element_with_offset(show_canvas, 400, 400)
            ac.release()
            ac.perform()
        # tools should all be hidden while cropping.
        for tool, button in buttons.items():
            self.assertFalse(button.is_displayed(), '%s button should not be visible in crop mode')
        d.find_element_by_id('done').click()
        self.assertEqual(show_canvas.size, {'width': 300, 'height': 300})

        # draw a rectangle
        with ActionChains(d) as ac:
            ac.move_to_element(buttons['rectangle'])
            ac.click()
            ac.move_to_element_with_offset(show_canvas, 20, 20)
            ac.click_and_hold()
            ac.move_to_element_with_offset(show_canvas, 280, 280)
            ac.release()
            ac.perform()

        # pick a different color (blue)
        with ActionChains(d) as ac:
            ac.click(buttons['color'])
            ac.click(d.find_element_by_css_selector('#color ul li:nth-child(10)'))
            ac.perform()
        self.assertEquals(selected_color(), 'rgba(0, 0, 255, 1)')

        # draw a line
        with ActionChains(d) as ac:
            ac.click(buttons['line'])
            ac.move_to_element_with_offset(show_canvas, 150, 10)
            ac.click_and_hold()
            ac.move_to_element_with_offset(show_canvas, 10, 150)
            ac.release()
            ac.perform()

        # draw an arrow       
        with ActionChains(d) as ac:
            ac.click(buttons['arrow'])
            ac.move_to_element_with_offset(show_canvas, 150, 290)
            ac.click_and_hold()
            ac.move_to_element_with_offset(show_canvas, 290, 150)
            ac.release()
            ac.perform()

        # draw a free-hand line (a golden spiral)
        with ActionChains(d) as ac:
            ac.click(buttons['free-line'])
            ac.move_to_element_with_offset(show_canvas, 100, 100)
            ac.click_and_hold()
            phi = (1 + math.sqrt(5)) / 2
            b = math.log(phi) / 90
            for i in range(0, 540, 5):
                r = 7 * math.exp(b * i)
                rad = i * math.pi / 180
                x = int(r * math.cos(rad))
                y = int(r * math.sin(rad))
                ac.move_to_element_with_offset(show_canvas, 150 + x, 150 + y)
            ac.release()
            ac.perform()

        # draw a circle
        with ActionChains(d) as ac:
            ac.click(buttons['ellipse'])
            ac.move_to_element_with_offset(show_canvas, 25, 75)
            ac.click_and_hold()
            ac.move_to_element_with_offset(show_canvas, 275, 250)
            ac.release()
            ac.perform()

        # pick a different color (orange)
        with ActionChains(d) as ac:
            ac.click(buttons['color'])
            ac.click(d.find_element_by_css_selector('#color ul li:nth-child(4)'))
            ac.perform()
        self.assertEquals(selected_color(), 'rgba(255, 153, 0, 1)')

        # add a text annotation
        with ActionChains(d) as ac:
            ac.click(buttons['text'])
            ac.move_to_element_with_offset(show_canvas, 10, 10)
            ac.click()
            ac.send_keys('test123', Keys.ENTER, '456')
            ac.move_to_element_with_offset(show_canvas, 100, 100)
            ac.click()
            ac.perform()

        time.sleep(3)


if __name__ == '__main__':
    unittest.main()
