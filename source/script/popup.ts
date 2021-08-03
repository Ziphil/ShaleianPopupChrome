//

import {
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
    popupElement.id = "shaleian-popup";
    document.body.append(popupElement);
    console.log("[ShaleianPopup] An element for popups is appended");
  }

  private addEventListeners(): void {
    let linkElements = document.querySelectorAll<HTMLAnchorElement>(".sans a");
    linkElements.forEach((linkElement) => {
      linkElement.addEventListener("mouseover", () => {
        let name = linkElement.innerText;
        chrome.runtime.sendMessage({channel: "searchByName", name}, (plainWord) => {
          let word = (plainWord !== null) ? Parser.createSimple().parse(Word.fromPlain(plainWord)) : null;
          console.log(word);
        });
      });
    });
  }

}