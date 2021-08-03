//


export abstract class Executor {

  protected abstract execute(): void;

  public static execute<E extends Executor>(this: new() => E): E {
    let executor = new this();
    window.addEventListener("load", () => {
      executor.execute();
    });
    return executor;
  }

  protected sendMessage<M = any, R = any>(channel: string, message: M): Promise<R> {
    let promise = new Promise<R>((resolve, reject) => {
      chrome.runtime.sendMessage<M, R>({...message, channel}, (response) => {
        resolve(response);
      });
    });
    return promise;
  }

  public static addLoadListener(listener: (event: Event) => any): void {
    window.addEventListener("load", listener);
  }

}