      {/* <form onSubmit={handleSubmit}>
        {onVoiceModeChange && (
          <div
          // className={cn(
          //   "absolute inset-0 flex items-center gap-2 rounded-2xl backdrop-blur-xl border border-primary/20 pr-1.5 pl-2 shadow-lg transition-all duration-300 md:pr-2 md:pl-3 bg-pink-500",
          //   isVoiceMode
          //     ? "pointer-events-auto z-50 scale-100 opacity-100"
          //     : "pointer-events-none z-0 scale-95 opacity-0"
          // )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full text-muted-foreground shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak now or type..."
              className="h-8 flex-1 border-none bg-muted/30 px-3 text-[15px] font-medium text-foreground shadow-none outline-none placeholder:text-primary/60 rounded-lg focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim()) onSubmit?.()
                }
              }}
            />
            <div className="flex h-8 items-center gap-2 rounded-full border border-primary/20 bg-muted/30 px-2 shrink-0">
              <div className="flex h-3 items-center gap-[3px]">
                <VoiceBar delay="0.1s" height={30} />
                <VoiceBar delay="0.3s" height={60} />
                <VoiceBar delay="0.5s" height={45} />
                <VoiceBar delay="0.2s" height={75} />
                <VoiceBar delay="0.6s" height={35} />
                <VoiceBar delay="0.4s" height={65} />
                <VoiceBar delay="0.7s" height={25} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="rounded-full h-5 w-5 text-primary hover:bg-primary/20 flex items-center justify-center p-0"
                onClick={() => onVoiceModeChange(false)}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
            <Button
              type="submit"
              className="size-8 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 flex items-center justify-center shrink-0"
              onClick={
                isGenerating
                  ? (e) => {
                    e.preventDefault()
                    onStop?.()
                  }
                  : undefined
              }
            >
              {isGenerating ? (
                <div className="h-3 w-3 rounded-sm bg-background" />
              ) : input.trim() ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              selectedMedia === "image"
                ? "Describe the image you want to generate..."
                : selectedMedia === "video"
                  ? "Describe the video you want to create..."
                  : selectedMedia === "live"
                    ? isLiveConnected
                      ? "Connected to Gemini Live. Speak naturally..."
                      : "Click 'Start Live' to begin a voice call..."
                    : "Ask me anything or describe what you need help with..."
            }
            disabled={isLoading || isLiveConnected}
            className="text-foreground placeholder:text-muted-foreground/50 min-h-px max-h-[120px] resize-none border-0 bg-red-500 px-4 py-2 text-sm leading-tight focus-visible:ring-0"
          />
        </div>

        <div className="relative flex items-center gap-3 bg-muted/20 backdrop-blur-md px-4 py-3 border-t border-border/20">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {selectedMedia === "image" && <ImageControls />}
            {selectedMedia === "live" && onLiveConnect && (
              <LiveControls
                isConnected={isLiveConnected}
                isSpeaking={isLiveSpeaking}
                onConnect={onLiveConnect}
                onDisconnect={onLiveDisconnect}
              />
            )}
            {selectedMedia === "video" ||
              selectedMedia === "audio" ||
              selectedMedia === "3d" ? (
              <span className="text-xs text-muted-foreground">
                {selectedMedia === "video"
                  ? "Video generation"
                  : selectedMedia === "audio"
                    ? "Audio generation"
                    : "3D generation"}{" "}
                via MuAPI
              </span>
            ) : null}
            {!isLiveConnected && (
              <>
                <DynamicIslandPreview />
                <MediaSwitcher />
                <OverflowActionsPreview />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-dashed rounded-full"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full px-0 text-muted-foreground"
                    onClick={handleAttachFile}
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </motion.div>
                <AiProvider />
              </>

              <Select
                value={selectedModelId || selectedModel}
                onValueChange={(val) => {
                  setSelectedModel(val)
                  onModelChange?.(val)
                  for (const [pid, pConfig] of Object.entries(providers)) {
                    if (pConfig.models.some((m) => m.id === val)) {
                      setSelectedProvider(pid)
                      break
                    }
                  }
                }}
              >
                <SelectTrigger className="h-8 w-auto min-w-[120px] gap-1.5 px-2.5 text-xs">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const seen = new Set<string>()
                    const items: {
                      modelId: string
                      name: string
                      ProviderIcon: React.ElementType
                    }[] = []
                    for (const provider of Object.values(providers)) {
                      for (const model of provider.models) {
                        if (!seen.has(model.id)) {
                          seen.add(model.id)
                          items.push({
                            modelId: model.id,
                            name: model.name,
                            ProviderIcon: provider.icon,
                          })
                        }
                      }
                    }
                    return items.map(({ modelId, name, ProviderIcon }) => (
                      <SelectItem
                        key={modelId}
                        value={modelId}
                        className="text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <ProviderIcon className="h-3.5 w-3.5" />
                          {name}
                        </span>
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex shrink-0 items-center self-center gap-1 absolute left-1/2 -translate-x-1/2 border p-1.5 rounded-full">
            <AnimatePresence mode="popLayout">
              {MEDIA_TYPES.map((media) => {
                const Icon = media.icon
                const isSelected = selectedMedia === media.id
                return (
                  <motion.div
                    key={media.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedMedia(media.id)}
                      className={cn(
                        "h-7 gap-1.5 p-1.5 transition-all duration-200 rounded-full border"
                      )}
                      title={media.label}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                    </Button>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <Popover>
              <PopoverTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 p-1.5 transition-all duration-200 rounded-full border"
                    title="More media types"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-48 p-2">
                <div className="space-y-1">
                  {MORE_MEDIA_TYPES.map((media) => {
                    const Icon = media.icon
                    const isSelected = selectedMedia === media.id
                    return (
                      <Button
                        key={media.id}
                        type="button"
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedMedia(media.id)}
                        className="w-full justify-start gap-2 h-8"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-sm">{media.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!isLiveConnected && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-dashed rounded-full"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full px-0 text-muted-foreground"
                  onClick={handleAttachFile}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            {onVoiceModeChange && !isLiveConnected && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-dashed rounded-full"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full px-0 text-muted-foreground border border-dashed"
                  onClick={() => onVoiceModeChange(true)}
                  title="Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                onClick={
                  isGenerating
                    ? (e) => {
                      e.preventDefault()
                      onStop?.()
                    }
                    : undefined
                }
                disabled={!input.trim() || isLoading || isLiveConnected}
                size="sm"
                className="h-8 gap-2 px-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">
                  {isGenerating || isLoading ? (
                    <div className="h-3.5 w-3.5 rounded-sm bg-background animate-pulse" />
                  ) : (
                    "Send"
                  )}
                </span>
              </Button>
            </motion.div>
          </div>
        </div>
      </form> */}


















      