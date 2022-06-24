module.exports.day = function () {
  const today = new Date();

  const options = {
    weekday: "short",
    month: "long",
    day: "numeric",
  };

  return today.toLocaleDateString("EN-IN", options); //hi-IN
};
