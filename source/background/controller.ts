//


export class Controller {

  protected setup(): void {
  }

  public static setup<C extends Controller>(this: new() => C): C {
    let controller = new this();
    controller.setup();
    return controller;
  }

}