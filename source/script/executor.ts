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

  public static addLoadListener(listener: (event: Event) => any): void {
    window.addEventListener("load", listener);
  }

}