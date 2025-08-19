#!/usr/bin/env python3
import re

# Read the file
with open('client/pages/Index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the replacement pattern - match from the div containing "Going to" to the end of that div
old_pattern = r'''                    <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                        Going to
                      </label>
                      <button
                        onClick=\{\(\) => setShowToCities\(!showToCities\)\}
                        className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full hover:border-blue-500 touch-manipulation"
                      >
                        <Plane className="w-4 h-4 text-gray-500 mr-2" />
                        <div className="flex items-center space-x-2">
                          \{selectedToCity \? \(
                            <>
                              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                                \{cityData\[selectedToCity\]\?\.code\}
                              </div>
                              <span className="text-sm text-gray-700 font-medium">
                                \{cityData\[selectedToCity\]\?\.airport\}
                              </span>
                            </>
                          \) : \(
                            <span className="text-sm text-gray-500 font-medium">
                              Going to
                            </span>
                          \)\}
                        </div>
                      </button>

                      \{showToCities && \(
                        <div className="absolute top-14 left-0 right-0 sm:right-auto bg-white border border-gray-200 rounded-lg shadow-xl p-3 sm:p-4 z-50 w-full sm:w-96 max-h-80 overflow-y-auto">
                          <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                              Airport, city or country
                            </h3>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Dubai"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            \{Object\.entries\(cityData\)\.map\(\(\[city, data\]\) => \(
                              <button
                                key=\{city\}
                                onClick=\{\(\) => \{
                                  setSelectedToCity\(city\);
                                  setShowToCities\(false\);
                                \}\}
                                className="w-full text-left px-3 py-3 hover:bg-gray-100 rounded"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Plane className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      <span className="font-semibold">
                                        \{data\.code\}
                                      </span>\{" "\}
                                      [^{]+\{city\}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      \{data\.airport\}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      \{data\.fullName\}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            \)\)\}
                          </div>
                        </div>
                      \)\}
                    </div>'''

new_replacement = '''                    <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
                      <CityAutocomplete
                        label="Going to"
                        placeholder="City or airport"
                        value={toAirport}
                        onChange={setToAirport}
                        fetchOptions={searchAirportsWithFallback}
                        icon={<Plane className="w-4 h-4" />}
                        className="relative"
                      />
                    </div>'''

# Let's use a simpler approach - find the div and replace the content between specific markers
start_marker = '''                    <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                        Going to
                      </label>'''

end_marker = '''                      )}
                    </div>

                    <div className="relative overflow-visible lg:max-w-[250px] w-full lg:w-auto">'''

# Find the start and end positions
start_pos = content.find(start_marker)
if start_pos == -1:
    print("Start marker not found")
    exit(1)

end_pos = content.find(end_marker, start_pos)
if end_pos == -1:
    print("End marker not found")
    exit(1)

# Extract the content to replace
old_content = content[start_pos:end_pos + len("                      )}")]

print("Found content to replace:")
print(repr(old_content[:200] + "..."))

# Create the new content
new_content = content[:start_pos] + new_replacement + content[end_pos + len("                      )}") + len("\n                    </div>\n"):]

# Write back to file
with open('client/pages/Index.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement completed successfully!")
