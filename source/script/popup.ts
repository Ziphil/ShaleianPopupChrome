//

import {
  ParsedWord,
  Parser,
  Word
} from "soxsot";
import {
  Executor
} from "./executor";


export class PopupExecutor extends Executor {

  protected execute(): void {
    this.appendPopup();
    this.addEventListeners();
  }

  private appendPopup(): void {
    let popupElement = document.createElement("div");
    popupElement.id = "shp-root";
    document.body.append(popupElement);
    console.log("[ShaleianPopup] An element for popups is appended");
  }

  private addEventListeners(): void {
    let linkElements = document.querySelectorAll<HTMLAnchorElement>(".sans a");
    let popupElement = document.getElementById("shp-root")!;
    linkElements.forEach((linkElement) => {
      linkElement.addEventListener("mouseover", () => {
        let name = linkElement.innerText;
        chrome.runtime.sendMessage({channel: "searchByName", name}, (plainWord) => {
          let word = (plainWord !== null) ? Parser.createSimple().parse(Word.fromPlain(plainWord)) : null;
          let html = (word !== null) ? PopupExecutor.createWordHtml(word) : null;
          if (html !== null) {
            popupElement.innerHTML = html;
          }
        });
      });
    });
  }

  private static createWordHtml(word: ParsedWord<string>): string | null{
    let section = word.parts["ja"]?.sections[0];
    if (section !== undefined) {
      let html = "";
      let equivalents = section.getEquivalents(true);
      for (let equivalent of equivalents) {
        if (equivalent.category) {
          html += `<span class="shp-category">${equivalent.category}</span>`;
        }
        if (equivalent.frame) {
          html += `<span class="shp-frame">${equivalent.frame}</span>`;
        }
        html += equivalent.names.join(", ");
      }
      return html;
    } else {
      return null;
    }
  }

}