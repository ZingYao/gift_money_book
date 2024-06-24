const fs = require('fs');
const archiver = require('archiver');

// 定义生成压缩包的路径和文件名
const outputPath = 'build.zip';

// 获取当前项目的路径
const projectPath = process.cwd();

// 创建可写流来写入压缩数据
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
    zlib: { level: 9 }
});

// 监听压缩完成事件
archive.on('finish', () => {
    console.log(`压缩完成，生成的压缩包路径为：${outputPath}`);
});

// 监听错误事件
archive.on('error', (err) => {
    throw err;
});

// 将压缩数据写入可写流
archive.pipe(output);

// 添加要压缩的文件或文件夹
archive.directory(projectPath + '/build', 'build'); // 修改此处，指定添加到压缩包中的目录名称为 'build'

// 完成压缩
archive.finalize();