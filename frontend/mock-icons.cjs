const React = require("react");

function IconMock(props) {
  return React.createElement("Icon", props);
}

module.exports = {
  Ionicons: IconMock,
  MaterialIcons: IconMock,
  FontAwesome: IconMock,
};
