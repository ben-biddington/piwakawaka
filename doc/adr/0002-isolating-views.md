# 2. Isolating Views

Date: 2019-03-21

Is it possible to set up our views by themselves, supply stubs and mocks and verify behaviour?

## Supplying ports

Because we're executing in a real browser, we do not have direct access to the DOM -- or do we?

It **is** possible to execute arbitrary javascript (we do that already) -- we could potentially supply fakes that way.

## Unplugged mode

Because our screen is dynamic and queries its ports on load, we need to be able to signal it to run unplugged.

## Passing functions

This requires serialization and `eval`.

## Setting unplugged

You can't do that if not running from a server as query params don't work. Hmmm.

## Consider replacing the application

If we're isolating view, does that mean we should replace the application? 

This means all we're verifying is the actions reaised by the view itself.

One problem is that it is the **application** that triggers the render and so we'd have to reimplement that behaviour just to get things to click on. 