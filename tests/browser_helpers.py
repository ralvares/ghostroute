"""Real-input world traversal shared by console browser tests."""
from playwright.sync_api import expect

def walk_to(page,x,y):
    # With the deterministic RAF clock, render header-driven scene changes
    # before measuring/clicking the canvas and its accessible target overlays.
    if page.evaluate("typeof window.stepGame === 'function'"):page.evaluate('stepGame()')
    page.wait_for_function("document.querySelector('#world').dataset.cameraY !== undefined")
    canvas=page.locator('#world')
    # A narrow viewport follows the investigator. Walk until the destination is
    # visible before clicking it, as a player must; never click outside the canvas.
    for _ in range(12):
        view=canvas.evaluate('c=>({width:c.width,height:c.height,x:Number(c.dataset.cameraX||0),y:Number(c.dataset.cameraY||0)})')
        key='a' if x<view['x'] else 'd' if x>view['x']+view['width'] else 'w' if y<view['y'] else 's' if y>view['y']+view['height'] else None
        if key is None:break
        canvas.focus();page.keyboard.down(key);page.evaluate('stepGame(30)');page.keyboard.up(key)
    else:raise AssertionError('Destination could not be reached within the world viewport')
    box=canvas.bounding_box()
    point={'x':box['x']+(x-view['x'])/view['width']*box['width'],'y':box['y']+(y-view['y'])/view['height']*box['height']}
    # Painted labels are accessible destination buttons. Use the browser's
    # normal hit testing when a label occupies the requested floor position,
    # just as a player's click would; unrelated HUD panels must still fail.
    hit=page.evaluate("p=>{const e=document.elementFromPoint(p.x,p.y);return {world:e?.id==='world'||Boolean(e?.closest('.worldTargets button')),label:e?.closest('.worldTargets button')?.getAttribute('aria-label')};}",point)
    assert hit['world'],f"World destination ({x}, {y}) is covered by a HUD panel"
    page.mouse.click(point['x'],point['y'])
    if page.evaluate("typeof window.stepGame === 'function'"):page.evaluate('stepGame(200)')

def open_bastion(page):
    if page.locator('#shellshade').is_visible():return
    if page.locator('#details').is_visible():page.locator('#detailDone').click()
    if page.locator('#radio').is_visible():page.locator('#radioClose').click()
    scene=page.locator('#world').get_attribute('data-scene')
    while scene not in ['district','soc']:
        page.locator('#sceneBack').click();scene=page.locator('#world').get_attribute('data-scene')
    if scene=='district':
        walk_to(page,141,286);expect(page.locator('#world')).to_have_attribute('data-scene','soc')
    if page.locator('#world').get_attribute('data-reaction')=='running':
        if page.evaluate("typeof window.stepGame === 'function'"):page.evaluate('stepGame(180)')
        expect(page.locator('#world')).to_have_attribute('data-reaction','arrived')
        if page.locator('#radio').is_visible():page.locator('#radioClose').click()
    walk_to(page,650,320);expect(page.locator('#shellshade')).to_be_visible()
