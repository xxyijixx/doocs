package web

import "embed"

//go:embed dist/index.html
var IndexByte []byte

//go:embed dist/*
var Dist embed.FS

//go:embed widget/dist/*
var WidgetDist embed.FS
