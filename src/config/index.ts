export default {
  development: {
    envFilePath: '.env.development',
    uploadPath: './public/uploads',
  },
  test: {
    envFilePath: '/home/.env.test',
    uploadPath: '/var/www/mvp/public/uploads',
  },
  production: {
    envFilePath: '/home/.env.production',
    uploadPath: '/var/www/mvp/public/uploads',
  },
};
