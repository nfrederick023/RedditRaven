export const getPixivDetails = async (id: string, frame: string): Promise<void> => {
  const response = await fetch("https://www.pixiv.net/ajax/illust/" + id, {
    method: "GET",
  });

  if (response.ok) {
    const res = await response.json();
    const masterUrl: string = res.body.userIllusts[id].url;
    const ext: string = res.body.userIllusts[id].url.split(".").pop();
    // output: "/img/2021/03/19/15/18/57/""
    const originalUrl = "https://i.pximg.net/img-original" + masterUrl.split("img-master")[1].split(id)[0] + id + "_p" + frame + "." + ext;
    console.log(originalUrl);
  }
};
