import os

def compile_files_to_txt():
    # Get the current directory where the script is running
    current_dir = os.getcwd()
    # Name of the output file
    output_file = "compiled_files.txt"

    try:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            # Walk through all files in the directory
            for file in os.listdir(current_dir):
                # Skip the output file itself and the script file
                if file != output_file and file != os.path.basename(__file__):
                    # Try to read each file
                    try:
                        with open(file, 'r', encoding='utf-8') as infile:
                            # Write the filename marker
                            outfile.write(f"//filename: {file}\n")
                            # Write the file contents
                            outfile.write(infile.read())
                            # Add a separator between files
                            outfile.write("\n\n" + "="*50 + "\n\n")
                    except Exception as e:
                        outfile.write(f"//filename: {file}\n")
                        outfile.write(f"Error reading file: {str(e)}\n\n")

        print(f"Successfully created {output_file}")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    compile_files_to_txt()
