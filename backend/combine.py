import os

def compile_files_to_txt():
    # Get the current directory where the script is running
    current_dir = os.getcwd()
    # Name of the output file
    output_file = "compiled_files.txt"

    try:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            # Walk through all directories and files
            for root, dirs, files in os.walk(current_dir):
                # Skip the output file's directory if it's in a subdirectory
                if output_file in files:
                    files.remove(output_file)
                # Skip the script file itself
                if os.path.basename(__file__) in files:
                    files.remove(os.path.basename(__file__))

                for file in files:
                    # Get the full file path
                    file_path = os.path.join(root, file)
                    # Get relative path from current directory
                    rel_path = os.path.relpath(file_path, current_dir)

                    # Try to read each file
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            # Write the filepath marker
                            outfile.write(f"//filepath: {rel_path}\n")
                            outfile.write("//content:\n")
                            # Write the file contents
                            outfile.write(infile.read())
                            # Add a separator between files
                            outfile.write("\n\n" + "="*50 + "\n\n")
                    except Exception as e:
                        outfile.write(f"//filepath: {rel_path}\n")
                        outfile.write(f"Error reading file: {str(e)}\n\n")
                        outfile.write("="*50 + "\n\n")

        print(f"Successfully created {output_file}")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    compile_files_to_txt()
