"""Real-input world traversal shared by console browser tests."""
from playwright.sync_api import expect

def walk_to(page,x,y):
    page.wait_for_function("document.querySelector('#world').dataset.cameraY !== undefined")
    canvas=page.locator('#world');box=canvas.bounding_box()
    view=canvas.evaluate('c=>({width:c.width,height:c.height,x:Number(c.dataset.cameraX||0),y:Number(c.dataset.cameraY||0)})')
    canvas.click(position={'x':(x-view['x'])/view['width']*box['width'],'y':(y-view['y'])/view['height']*box['height']})
    if page.evaluate("typeof window.stepGame === 'function'"):page.evaluate('stepGame(200)')

def open_bastion(page):
    if page.locator('#shellshade').is_visible():return
    if page.locator('#details').is_visible():page.locator('#detailDone').click()
    if page.locator('#radio').is_visible():page.locator('#radioClose').click()
    scene=page.locator('#world').get_attribute('data-scene')
    while scene not in ['district','soc']:
        page.locator('#sceneBack').click();scene=page.locator('#world').get_attribute('data-scene')
    if scene=='district':
        walk_to(page,210,340);expect(page.locator('#world')).to_have_attribute('data-scene','soc')
    if page.locator('#world').get_attribute('data-reaction')=='running':
        if page.evaluate("typeof window.stepGame === 'function'"):page.evaluate('stepGame(180)')
        expect(page.locator('#world')).to_have_attribute('data-reaction','arrived')
        if page.locator('#radio').is_visible():page.locator('#radioClose').click()
    walk_to(page,650,320);expect(page.locator('#shellshade')).to_be_visible()
