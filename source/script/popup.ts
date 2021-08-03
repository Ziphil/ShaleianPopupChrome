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
      linkElement.addEventListener("mouseover", async () => {
        let name = linkElement.innerText;
        let plainWord = await this.sendMessage("searchByName", {name});
        let word = (plainWord !== null && plainWord !== undefined) ? Parser.createSimple().parse(Word.fromPlain(plainWord)) : null;
        let html = (word !== null) ? PopupExecutor.createWordHtml(word) : null;
        if (html !== null) {
          popupElement.innerHTML = html;
          popupElement.style.display = "block";
          this.movePopupElement(linkElement);
        }
      });
    });
  }

  private movePopupElement(targetElement: HTMLElement): void {
    let popupElement = document.getElementById("shp-root")!;
    let rect = targetElement.getBoundingClientRect();
    let top = window.pageYOffset + rect.top - popupElement.offsetHeight - 10;
    let left = window.pageXOffset + rect.left - (popupElement.offsetWidth - targetElement.offsetWidth) / 2;
    popupElement.style.top = `${top}px`;
    popupElement.style.left = `${left}px`;
  }

  private static createWordHtml(word: ParsedWord<string>): string | null {
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