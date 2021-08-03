//

import {
  MarkupResolver,
  ParsedWord,
  Parser,
  Word
} from "soxsot";
import {
  Executor
} from "./executor";


export class PopupExecutor extends Executor {

  private popupElement!: HTMLElement;
  private rootElement!: HTMLElement;

  protected execute(): void {
    this.appendPopup();
    this.addEventListeners();
  }

  private appendPopup(): void {
    let popupElement = document.createElement("div");
    let shadowElement = popupElement.attachShadow({mode: "closed"});
    let rootElement = document.createElement("div");
    let styleElement = document.createElement("style");
    let css = require("../public/popup.scss").default;
    popupElement.id = "shaleian-popup-injection";
    rootElement.className = "root";
    document.body.append(popupElement);
    styleElement.append(document.createTextNode(css));
    shadowElement.append(styleElement, rootElement);
    this.popupElement = popupElement;
    this.rootElement = rootElement;
    console.log("[ShaleianPopup] An element for popups is appended");
  }

  private addEventListeners(): void {
    let resolver = PopupExecutor.createMarkupResolver();
    let parser = new Parser(resolver);
    let linkElements = document.querySelectorAll<HTMLAnchorElement>(".sans a");
    linkElements.forEach((linkElement) => {
      linkElement.addEventListener("mouseover", async () => {
        let name = linkElement.innerText;
        let plainWord = await this.sendMessage("searchByName", {name});
        let word = (plainWord !== null && plainWord !== undefined) ? parser.parse(Word.fromPlain(plainWord)) : null;
        let html = (word !== null) ? PopupExecutor.createWordHtml(word) : null;
        if (html !== null) {
          this.rootElement.innerHTML = html;
          this.popupElement.style.display = "block";
          this.movePopupElement(linkElement);
        }
      });
      linkElement.addEventListener("mouseleave", () => {
        this.popupElement.style.display = "none";
      });
    });
  }

  private movePopupElement(targetElement: HTMLElement): void {
    let popupElement = this.popupElement;
    let rect = targetElement.getBoundingClientRect();
    let top = window.pageYOffset + rect.top - popupElement.offsetHeight - 5;
    let left = window.pageXOffset + rect.left - (popupElement.offsetWidth - targetElement.offsetWidth) / 2;
    popupElement.style.top = `${top}px`;
    popupElement.style.left = `${left}px`;
  }

  private static createWordHtml(word: ParsedWord<string>): string | null {
    let section = word.parts["ja"]?.sections[0];
    if (section !== undefined) {
      let html = "";
      let equivalents = section.getEquivalents(true);
      let informations = section.getNormalInformations(true).filter((information) => information.kind === "meaning" || information.kind === "usage");
      html += `<div class="equivalents section-item list">`;
      for (let equivalent of equivalents) {
        html += `<div class="equivalent text list-item">`;
        if (equivalent.category) {
          html += `<span class="equivalent-category tag right-margin">${equivalent.category}</span>`;
        }
        if (equivalent.frame) {
          html += `<span class="equivalent-frame small right-margin">(${equivalent.frame})</span>`;
        }
        html += equivalent.names.join(", ");
        html += `</div>`;
      }
      html += `</div>`;
      for (let information of informations) {
        html += `<div class="information section-item">`;
        html += `<span class="information-kind small-head">${information.getKindName("ja")}</span>`;
        html += `<span class="information-text text">${information.text}</span>`;
        html += `</div>`;
      }
      return html;
    } else {
      return null;
    }
  }

  private static createMarkupResolver(): MarkupResolver<string, string> {
    let resolver = new MarkupResolver<string, string>({
      resolveLink: (name, children) => children.join(""),
      resolveBracket: (children) => `<span class="sans">${children.join("")}</span>`,
      resolveSlash: (string) => `<span class="italic">${string}</span>`,
      join: (nodes) => nodes.join("")
    });
    return resolver;
  }

}