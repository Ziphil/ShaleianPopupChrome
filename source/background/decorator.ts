//

import "reflect-metadata";
import {
  Controller
} from "./controller";


const KEY = Symbol("background");

type Metadata = Array<ListenerSpec>;
type ListenerSpec = {
  name: string | symbol,
  channel: string
};

type ControllerDecorator = (clazz: new() => Controller) => void;
type ListenerMethodDecorator = (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<ListenerMethod>) => void;
type ListenerMethod = (message: any, sender: any, sendResponse: (response?: any) => void) => any;

export function controller(): ControllerDecorator {
  let decorator = function (clazz: new() => Controller): void {
    let originalSetup = clazz.prototype.setup;
    clazz.prototype.setup = async function (this: Controller): Promise<void> {
      let anyThis = this as any;
      let metadata = Reflect.getMetadata(KEY, clazz.prototype) as Metadata;
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        let spec = metadata.find((spec) => spec.channel === message.channel);
        if (spec !== undefined) {
          anyThis[spec.name].call(this, message, sender, sendResponse);
        }
      });
      originalSetup.call(this);
    };
  };
  return decorator;
}

export function listener(channel: string): ListenerMethodDecorator {
  let decorator = function (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<ListenerMethod>): void {
    let metadata = getMetadata(target);
    metadata.push({name, channel});
  };
  return decorator;
}

function getMetadata(target: object): Metadata {
  let metadata = Reflect.getMetadata(KEY, target) as Metadata;
  if (!metadata) {
    metadata = [];
    Reflect.defineMetadata(KEY, metadata, target);
  }
  return metadata;
}