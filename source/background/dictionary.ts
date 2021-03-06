//

import axios from "axios";
import {
  Dictionary,
  NormalParameter
} from "soxsot";
import {
  Controller
} from "./controller";
import {
  controller,
  listener
} from "./decorator";


@controller()
export class DictionaryController extends Controller {

  private dictionary?: Dictionary;

  protected async setup(): Promise<void> {
    await this.fetchDictionary();
  }

  private async fetchDictionary(): Promise<void> {
    let response = await axios.get("https://dic.ziphil.com/api/dictionary/fetch");
    let dictionary = Dictionary.fromPlain(response.data);
    this.dictionary = dictionary;
    console.log("Dictionary fetched");
  }

  @listener("searchByName")
  private [Symbol()](message: any, sender: any, sendResponse: (response?: any) => void): void {
    let dictionary = this.dictionary;
    if (dictionary !== undefined) {
      let name = message.name;
      let parameter = new NormalParameter(name, "name", "exact", "ja", {diacritic: false, case: false});
      let result = dictionary.search(parameter);
      let word = result.words[0];
      if (word) {
        sendResponse(word.toPlain());
      } else {
        if (result.suggestions.length > 0 && result.suggestions[0].kind !== "revision") {
          let suggestion = result.suggestions[0];
          let suggestedParameter = new NormalParameter(suggestion.names[0], "name", "exact", "ja", {diacritic: false, case: false});
          let suggestedResult = dictionary.search(suggestedParameter);
          let suggestedWord = suggestedResult.words[0];
          if (suggestedWord) {
            sendResponse(suggestedWord.toPlain());
          } else {
            sendResponse();
          }
        } else {
          sendResponse();
        }
      }
    }
  }

}