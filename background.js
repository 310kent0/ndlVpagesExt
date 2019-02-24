function openPage() {
  browser.tabs.create({
    url: "ndl_vpages.html"
  });
}

browser.browserAction.onClicked.addListener(openPage);
