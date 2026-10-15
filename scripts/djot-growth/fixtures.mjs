export const families = {
  repeated_labels: n => Array(n).fill('![a [b](u) c](img)').join('\n\n'),
  shared_attributes: n => Array(n).fill('![x][r]').join('\n\n') + '\n\n{title="shared value" .shared}\n[r]: img',
  nested_containers: n => '::: box\n'.repeat(n) + 'body\n:::',
  definition_lists: n => Array.from({length: n}, (_, i) => `: term ${i}\n\n  body ${i}`).join('\n\n'),
  quoted_unicode_images: n => (('![日本語,\n').repeat(n) + 'z' + '](u)'.repeat(n)).split('\n').map(line => '> ' + line).join('\n'),
}

export const sizesFor = family => family === 'nested_containers' ? [16, 32, 64, 128, 256]
  : family === 'quoted_unicode_images' ? [8, 16, 32, 64] : [64, 128, 256, 512]
