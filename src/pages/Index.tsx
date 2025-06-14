import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFile, setProcessedFile] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullText = "Transform Your Word documents into structured Excel reports with AI-powered task extraction and categorization";

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(uploadedFile);
      setError(null);
      setProcessedFile(null);
      toast({
        title: "File uploaded successfully",
        description: `${uploadedFile.name} is ready for processing`,
      });
    } else {
      setError('Please upload a valid Word document (.docx)');
      toast({
        title: "Invalid file type",
        description: "Please upload a .docx file",
        variant: "destructive",
      });
    }
  };

  const processDocument = async () => {
    if (!file) return;
  
    setProcessing(true);
    setProgress(0);
    setError(null);
  
    const progressSteps = [10, 30, 55, 75, 100];
    let step = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (step >= progressSteps.length) {
          clearInterval(progressInterval);
          return 100;
        }
        return progressSteps[step++];
      });
    }, 700);
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      console.log("🚀 Sending request to backend...");
      
      // Updated backend URL
      const backendUrl = "https://bf508ab0-fd57-46a3-b3cb-36a7b59bc690-00-2pkzrgitnbf6j.pike.replit.dev";
      
      // Test backend connection first
      try {
        console.log("🔍 Testing backend connection...");
        const healthCheck = await fetch(`${backendUrl}/health`, {
          method: "GET",
          mode: 'cors'
        });
        console.log("🏥 Health check response:", healthCheck.status);
        
        if (healthCheck.ok) {
          const healthData = await healthCheck.json();
          console.log("🏥 Health data:", healthData);
        }
      } catch (healthError) {
        console.error("❌ Backend not reachable:", healthError);
        throw new Error("Backend server is not reachable. Please check if it's running.");
      }
      
      // Send the document for processing
      const response = await fetch(`${backendUrl}/process_doc`, {
        method: "POST",
        body: formData,
        mode: 'cors',
      });
      
      clearInterval(progressInterval);
  
      console.log("📡 Response status:", response.status);
      console.log("📋 Response headers:", Object.fromEntries(response.headers));
  
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Try to get detailed error message
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.error("❌ Could not parse error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }
  
      // Validate response
      const contentType = response.headers.get('content-type');
      console.log("📄 Content type:", contentType);
  
      const blob = await response.blob();
      console.log("📦 Received blob:", blob);
      console.log("📄 Blob type:", blob.type);
      console.log("📏 Blob size:", blob.size);
  
      // Validate blob
      if (blob.size === 0) {
        throw new Error("Received empty file from server");
      }
  
      if (blob.size < 1000) {
        // Suspiciously small file, might be an error message
        try {
          const text = await blob.text();
          console.log("📄 Small blob content:", text);
          if (text.includes('error') || text.includes('Error')) {
            throw new Error(text);
          }
        } catch (textError) {
          console.log("⚠️ Could not read small blob as text");
        }
      }
  
      // Create download URL
      const url = URL.createObjectURL(blob);
      const filename = file.name.replace(".docx", "_Processed.xlsx");
  
      setProcessedFile({ url, filename });
      setProgress(100);
  
      toast({
        title: "Processing Complete! 🎉",
        description: "Your Excel document is ready for download",
      });
  
    } catch (err) {
      console.error("❌ Processing error:", err);
      
      let errorMessage = "Processing failed. Please try again.";
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = "Cannot connect to server. Please check your internet connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      clearInterval(progressInterval);
    }
  };
  const handleDownload = () => {
    if (!processedFile) return;
    const link = document.createElement("a");
    link.href = processedFile.url;
    link.download = processedFile.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(processedFile.url);
  };

  const resetUpload = () => {
    setFile(null);
    setProcessedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed top-1/4 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full filter blur-3xl animate-float"></div>
      <div className="fixed bottom-1/3 right-16 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full filter blur-3xl animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      
      {/* Sparkle Elements */}
      <div className="fixed top-20 right-1/4 animate-pulse-soft">
        <Sparkles className="h-6 w-6 text-purple-400" />
      </div>
      <div className="fixed bottom-32 left-1/3 animate-pulse-soft" style={{animationDelay: '1s'}}>
        <Sparkles className="h-4 w-4 text-blue-400" />
      </div>
      <div className="fixed top-1/3 right-20 animate-pulse-soft" style={{animationDelay: '3s'}}>
        <Sparkles className="h-5 w-5 text-indigo-400" />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header with Typewriter Effect */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 relative inline-block">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
              Document Processing Suite
            </span>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500/60 via-blue-500/60 to-indigo-500/60 rounded-full shimmer-effect"></div>
          </h1>
          <div className="text-xl text-gray-600 max-w-3xl mx-auto min-h-[60px] animate-fade-in" style={{animationDelay: '0.5s'}}>
            <span className="border-r-2 border-blue-500 animate-pulse">{typewriterText}</span>
          </div>
        </div>

        {/* Enhanced Main Processing Card */}
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-scale-in hover:shadow-3xl transition-all duration-700 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5"></div>
            <CardHeader className="text-center pb-8 border-b border-gradient-to-r from-purple-200 to-blue-200 relative z-10">
              <CardTitle className="text-3xl flex items-center justify-center gap-3 text-gray-800">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse-soft">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                Document Processor
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Upload your Word document to extract tasks, budgets, and generate a professional scope of work
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-8 relative z-10">
              {/* Enhanced Upload Area */}
              {!file && (
                <div className="animate-fade-in">
                  <div
                    className="border-2 border-dashed border-purple-300 rounded-xl p-16 text-center hover:border-purple-500 transition-all cursor-pointer group bg-gradient-to-r from-purple-50/50 to-blue-50/50 hover:from-purple-100/50 hover:to-blue-100/50 relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl"></div>
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <Upload className="h-20 w-20 text-purple-500/60 absolute top-0 left-0 group-hover:opacity-0 transition-all duration-300 animate-float" />
                      <ArrowDown className="h-20 w-20 text-blue-500 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 relative z-10">Upload Word Document</h3>
                    <p className="text-gray-600 mb-6 text-lg relative z-10">
                      Click to select or drag and drop your .docx file
                    </p>
                    <Button className="hover-scale bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-8 py-3 text-lg">
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Enhanced File Selected */}
              {file && !processing && !processedFile && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 rounded-full animate-pulse-soft">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 text-xl">{file.name}</h4>
                        <p className="text-green-700 text-lg">Ready for AI processing</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={processDocument} className="hover-scale bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 text-lg">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Process Document
                      </Button>
                      <Button variant="outline" onClick={resetUpload} className="px-6 py-3">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Processing State */}
              {processing && (
                <div className="animate-fade-in">
                  <div className="p-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="relative mx-auto w-32 h-32 mb-6">
                      <div className="absolute inset-0 rounded-full border-8 border-blue-100"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin" 
                      ></div>
                      <Loader2 className="h-16 w-16 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-blue-900">AI Processing Document</h3>
                    <div className="max-w-md mx-auto mb-6">
                      <Progress value={progress} className="h-4 bg-blue-100" />
                      <p className="text-blue-700 mt-2 text-lg font-medium">{progress}% Complete</p>
                    </div>
                    <p className="text-blue-700 text-lg">
                      Please wait while our AI extracts and organizes your document content...
                    </p>
                  </div>
                </div>
              )}

              {/* Enhanced Processing Complete */}
              {processedFile && !processing && (
                <div className="animate-fade-in">
                  <div className="p-12 text-center bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:from-emerald-100 hover:to-green-100 transition-all shadow-lg">
                    <div className="relative mx-auto w-24 h-24 mb-6 group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-pulse-soft"></div>
                      <FileSpreadsheet className="h-20 w-20 text-white mx-auto relative z-10 mt-2" />
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg animate-bounce">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-900 mb-4">
                      Processing Complete! 🎉
                    </h3>
                    <p className="text-emerald-700 mb-8 text-lg">
                      Your Excel document has been generated successfully with AI-powered insights
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handleDownload} className="hover-scale bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 text-lg">
                        <Download className="h-5 w-5 mr-2" />
                        Download Excel
                      </Button>
                      <Button variant="outline" onClick={resetUpload} className="px-8 py-4 text-lg">
                        Process Another
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Error State */}
              {error && (
                <div className="animate-fade-in">
                  <div className="p-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-red-500 rounded-full animate-pulse">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 text-xl">Error</h4>
                      <p className="text-red-700 text-lg">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="text-center p-8 hover-scale bg-white/70 backdrop-blur-sm border-0 shadow-xl overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-20 h-20 mx-auto mb-6 group-hover:animate-float">
                  <FileText className="h-12 w-12 text-white mx-auto mt-2" />
                </div>
                <h3 className="font-bold mb-4 text-xl text-gray-800">Smart AI Extraction</h3>
                <p className="text-gray-600 text-lg">
                  Advanced AI-powered task and budget extraction from your documents
                </p>
              </div>
            </Card>
            
            <Card className="text-center p-8 hover-scale bg-white/70 backdrop-blur-sm border-0 shadow-xl overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 mx-auto mb-6 group-hover:animate-float" style={{animationDelay: '0.2s'}}>
                  <CheckCircle className="h-12 w-12 text-white mx-auto mt-2" />
                </div>
                <h3 className="font-bold mb-4 text-xl text-gray-800">Auto Categorization</h3>
                <p className="text-gray-600 text-lg">
                  Intelligent organization of tasks by category and priority
                </p>
              </div>
            </Card>
            
            <Card className="text-center p-8 hover-scale bg-white/70 backdrop-blur-sm border-0 shadow-xl overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-20 h-20 mx-auto mb-6 group-hover:animate-float" style={{animationDelay: '0.4s'}}>
                  <Download className="h-12 w-12 text-white mx-auto mt-2" />
                </div>
                <h3 className="font-bold mb-4 text-xl text-gray-800">Professional Excel Export</h3>
                <p className="text-gray-600 text-lg">
                  Beautifully formatted Excel reports with structure and insights
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Index;
