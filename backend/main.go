package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
	"webCash/static"
)

const port = 43197

func main() {
	for _, item := range os.Args {
		if item == "build" {
			file, err := os.Open("./build.zip")
			if err != nil {
				panic(err)
			}
			defer file.Close()
			fileContent, err := io.ReadAll(file)
			if err != nil {
				panic(err)
			}
			staticFileStr := `package static

func Static() []byte {
	return []byte{%s}
}`
			staticBytes := []string{}
			for _, b := range fileContent {
				staticBytes = append(staticBytes, fmt.Sprintf("%d", b))
			}
			staticFileStr = fmt.Sprintf(staticFileStr, strings.Join(staticBytes, ","))
			staticFile, err := os.OpenFile("./static/static.go", os.O_WRONLY|os.O_TRUNC, os.FileMode(0755))
			if err != nil {
				panic(err)
			}
			defer staticFile.Close()
			staticFile.WriteString(staticFileStr)
			return
		}
	}
	// 解压缩文件

	// 先删除文件夹
	os.RemoveAll("./build")
	err := unzip(static.Static(), "./")
	if err != nil {
		panic(err)
	}
    // 关闭时 删除文件夹
    defer os.RemoveAll("./build")
	r := gin.New()
	r.Static("/", "./build")
	go func() {
		time.Sleep(time.Second)
		openBrowser(fmt.Sprintf("http://localhost:%d", port))
	}()
	r.Run(fmt.Sprintf(":%d", port))
}

func unzip(src []byte, dst string) error {
	r, err := zip.NewReader(bytes.NewReader(src), int64(len(src)))
	if err != nil {
		return err
	}

	for _, f := range r.File {
		filePath := filepath.Join(dst, f.Name)

		if f.FileInfo().IsDir() {
			os.MkdirAll(filePath, os.ModePerm)
		} else {
			if err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm); err != nil {
				return err
			}

			inFile, err := f.Open()
			if err != nil {
				return err
			}
			defer inFile.Close()

			outFile, err := os.Create(filePath)
			if err != nil {
				return err
			}
			defer outFile.Close()

			_, err = io.Copy(outFile, inFile)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func openBrowser(url string) error {
	switch runtime.GOOS {
	case "windows":
		return windowsOpenBrowser(url)
	case "linux":
		return linuxOpenBrowser(url)
	case "darwin":
		return macOpenBrowser(url)
	}
	return nil
}

func windowsOpenBrowser(url string) error {
	// 使用 cmd 命令打开默认浏览器
	cmd := exec.Command("cmd", "/c", "start", url)
	return cmd.Run()
}

func macOpenBrowser(url string) error {
	cmd := exec.Command("open", url)
	return cmd.Run()
}

func linuxOpenBrowser(url string) error {
	cmd := exec.Command("xdg-open", url)
	return cmd.Run()
}
