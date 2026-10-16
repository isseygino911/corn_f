// Foreground cutout via macOS Vision. usage: osascript -l JavaScript scripts/cutout.js in.jpg /abs/out.png
ObjC.import('Foundation'); ObjC.import('Vision'); ObjC.import('CoreImage'); ObjC.import('AppKit')
function run(argv) {
  const url = $.NSURL.fileURLWithPath(argv[0])
  const handler = $.VNImageRequestHandler.alloc.initWithURLOptions(url, $({}))
  const req = $.VNGenerateForegroundInstanceMaskRequest.alloc.init
  const err = Ref()
  handler.performRequestsError($([req]), err)
  const obs = req.results.firstObject
  if (!obs) return 'no foreground'
  const buf = obs.generateMaskedImageOfInstancesFromRequestHandlerCroppedToInstancesExtentError(obs.allInstances, handler, true, err)
  const ci = $.CIImage.imageWithCVPixelBuffer(buf)
  const rep = $.NSBitmapImageRep.alloc.initWithCIImage(ci)
  const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $({}))
  png.writeToFileAtomically(argv[1], true)
  return 'ok'
}
