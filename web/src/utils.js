
/* Converts array of map scales to tile resolutions. */
export function scalesToResolutions(scales, units, dpi = 96) {
  const factor = {
    feet: 12.0,
    meters: 39.37,
    miles: 63360.0,
    degrees: 4374754.0
  }
  return scales.map(scale => parseInt(scale) / (dpi * factor[units]))
}

export function layersList (items) {
  const list = []
  items.forEach(item => {
    if (item.layers) {
      list.push(...layersList(item.layers))
    } else {
      list.push(item)
    }
  })
  return list
}

export function filterLayers (items, test) {
  const list = []
  items.forEach(item => {
    if (item.layers) {
      const children = filterLayers(item.layers, test)
      if (children.length) {
        list.push({
          ...item,
          layers: children
        })
      }
    } else if (test(item)) {
      list.push(item)
    }
  })
  return list
}

export function layersGroups (items) {
  const list = []
  items.forEach(item => {
    if (item.layers) {
      list.push(item, ...layersGroups(item.layers))
    }
  })
  return list
}
