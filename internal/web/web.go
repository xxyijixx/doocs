package web

import "embed"

//go:embed admin/dist/index.html
var IndexByte []byte

//go:embed admin/dist/*
var Dist embed.FS

//go:embed widget/dist/*
var WidgetDist embed.FS
