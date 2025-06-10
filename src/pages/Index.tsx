
import { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const simulateProcessing = async () => {
    setProcessing(true);
    setProgress(0);
    setError(null);

    // Simulate processing steps with progress updates
    const steps = [
      { progress: 20, message: "Loading document..." },
      { progress: 40, message: "Extracting task sentences..." },
      { progress: 60, message: "Processing with AI..." },
      { progress: 80, message: "Generating Excel structure..." },
      { progress: 100, message: "Finalizing document..." }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(step.progress);
    }

    // Simulate successful processing
    setProcessedFile(`processed_${file?.name?.replace('.docx', '.xlsx')}`);
    setProcessing(false);
    
    toast({
      title: "Processing complete!",
      description: "Your Excel document is ready for download",
    });
  };

  const handleDownload = () => {
    // In a real implementation, this would download the actual processed file
    const link = document.createElement('a');
    link.href = '#'; // Would be the actual file URL
    link.download = processedFile || 'processed_document.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your processed Excel file is downloading",
    });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Document Processing Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your Word documents into structured Excel reports with AI-powered task extraction and categorization
          </p>
        </div>

        {/* Main Processing Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm animate-scale-in">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Document Processor
              </CardTitle>
              <CardDescription className="text-base">
                Upload your Word document to extract tasks, budgets, and generate a professional scope of work
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Upload Area */}
              {!file && (
                <div className="animate-fade-in">
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-16 w-16 text-primary/60 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Upload Word Document</h3>
                    <p className="text-muted-foreground mb-4">
                      Click to select or drag and drop your .docx file
                    </p>
                    <Button variant="outline" className="hover-scale">
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

              {/* File Selected */}
              {file && !processing && !processedFile && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-900">{file.name}</h4>
                        <p className="text-sm text-green-700">Ready for processing</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={simulateProcessing} className="hover-scale">
                        Process Document
                      </Button>
                      <Button variant="outline" onClick={resetUpload}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing State */}
              {processing && (
                <div className="animate-fade-in">
                  <div className="p-8 text-center">
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-4">Processing Document</h3>
                    <div className="max-w-md mx-auto mb-4">
                      <Progress value={progress} className="h-3" />
                    </div>
                    <p className="text-muted-foreground">
                      Please wait while we extract and organize your document content...
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Complete */}
              {processedFile && !processing && (
                <div className="animate-fade-in">
                  <div className="p-8 text-center bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      Processing Complete!
                    </h3>
                    <p className="text-blue-700 mb-6">
                      Your Excel document has been generated successfully
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handleDownload} className="hover-scale">
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                      </Button>
                      <Button variant="outline" onClick={resetUpload}>
                        Process Another
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="animate-fade-in">
                  <div className="p-6 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-900">Error</h4>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 animate-fade-in">
            <Card className="text-center p-6 hover-scale bg-white/50 backdrop-blur-sm">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Extraction</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered task and budget extraction from your documents
              </p>
            </Card>
            
            <Card className="text-center p-6 hover-scale bg-white/50 backdrop-blur-sm">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Auto Categorization</h3>
              <p className="text-sm text-muted-foreground">
                Automatically organize tasks by category and priority
              </p>
            </Card>
            
            <Card className="text-center p-6 hover-scale bg-white/50 backdrop-blur-sm">
              <Download className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Excel Export</h3>
              <p className="text-sm text-muted-foreground">
                Professional Excel reports with formatting and structure
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
