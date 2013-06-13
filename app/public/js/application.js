// We'll put our stuff here to avoid "polluting the global namespace"
window.SeoulMix = {};

// Socket.io connection -- explicity on window to avoid any scope issues...ever
window.socket = io.connect("http://localhost");