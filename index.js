import puppeteer from "puppeteer";
import fs from "fs";

const getEmoteList = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    await page.goto("https://7tv.app/emote-sets/61d46393825ae71d82bf6bf1", {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const emotes = await page.evaluate(() => {
        let emoteList = [];
        let emoteElements = document.querySelectorAll('.emote-card-wrapper');

        emoteElements.forEach((emoteElement) => {
            let emote = {};
            emote.id = emoteElement.getAttribute('emote-id');
            emoteList.push(emote);
        });

        return emoteList;
    });

    console.log(emotes);

    await browser.close();

    fs.writeFileSync("emotes/emotes.json", JSON.stringify(emotes));
  };

const main = async () => {
    if (!fs.existsSync("emotes")) {
        fs.mkdirSync("emotes");
    }

    if (!fs.existsSync("emotes/emotes.json")) {
        await getEmoteList();
    }

    const emotes = JSON.parse(fs.readFileSync("emotes/emotes.json"));

    const browser = await puppeteer.launch();

    for (const emote of emotes) {
      const page = await browser.newPage();
      let imageUrl =  `https://cdn.7tv.app/emote/${emote.id}/4x.webp`;
      const viewSource = await page.goto(imageUrl);
      fs.writeFileSync("./emotes/" + emote.id + ".webp", await viewSource.buffer());
      console.log(`Downloaded ${emote.id}`);
    }
}

main();