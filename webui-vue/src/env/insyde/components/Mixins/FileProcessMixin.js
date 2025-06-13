export const fileApiConfig = {
  responseType: 'arraybuffer',
};

const defaultFileName = 'file.download';
const FileProcessMixin = {
  methods: {
    processFileFunc(response, config) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      console.log(response);
      link.href = url;
      link.download = (function (filename, localname) {
        let name = localname;
        if (filename) {
          name = filename.match(/(?:filename="(.*)")/i);
          name = Array.isArray(name) && name.length > 1 ? name[1] : localname;
        }
        return name;
      })(
        response.headers['content-disposition'],
        config?.filename ?? defaultFileName
      );
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  },
};

export default FileProcessMixin;
