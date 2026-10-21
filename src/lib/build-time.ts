// The moment pages are prerendered: it decides which banner the HTML calls current
// (docs/product.md §14 item 2). BANNERTIMER_NOW (an ISO date) pins it for tests.
export const BUILD_TIME = process.env.BANNERTIMER_NOW ? Date.parse(process.env.BANNERTIMER_NOW) : Date.now();
